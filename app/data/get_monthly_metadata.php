<?php
    // get_monthly_metadata.php
	require_once 'login.php';
	require_once 'common.php';
	$link = mysqli_connect($db_hostname, $db_username, $db_password, $db_database);

    if (mysqli_connect_errno()) {
        printf("Connect failed: %s\n", mysqli_connect_error());
    }
	
	if (isset($_GET['house']))
	{
		$house = get_post($link, 'house');
		if ($house != 'NULL') {
			get_data($link, $house);
		}
		else {
			echo "{ 'error' : 'house parameter not valid' }";
		}
	}
	else 
	{
		echo "{ 'error' : 'house parameter not found' }";
	}
	
function get_data($link, $house) {
	echo ")]}',\n ";
	// 0) list of years
	$query = "SELECT YEAR(date) FROM energy_monthly WHERE house_id = $house GROUP BY YEAR(date) ORDER BY date;";
	// 1) asof date
	$query .= "SELECT date FROM energy_hourly WHERE house_id = $house ORDER BY date DESC LIMIT 1;";
	// 2) house name
	$query .= "SELECT name FROM houses WHERE house_id = $house;";
	
	$output = array(
		"years" => array()
	);
	$queries = array( "years", "asof", "house" );
	date_default_timezone_set('America/New_York');
	
	if (mysqli_multi_query($link, $query)) 
	{
		$j = 0;
		do 
		{
			if ($result = mysqli_store_result($link)) 
			{
				
				switch($j)
				{
					case(0):
						// list of years
						$aRow = array();
						while ($row = mysqli_fetch_row($result)) 
						{
							$aRow[] = $row[0];
						}
						break;
					case(1):
						// as of date
						$row = mysqli_fetch_row($result);
						$aRow = date_format(date_create($row[0]), 'Y-m-d');
						break;
					case(2):
						// house name
						$row = mysqli_fetch_row($result);
						$aRow = $row[0];
				}
				$output[ $queries[$j] ] = $aRow;
				mysqli_free_result($result);
			}
			/* print divider */
			if (mysqli_more_results($link)) 
			{
				$j++;
			}
		} while (mysqli_next_result($link));
	} 	
	mysqli_close($link);

	echo json_encode( $output );
	
}
?>