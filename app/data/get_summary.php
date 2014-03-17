<?php
    // monthly_summary
    
    require_once 'login.php';
	require_once 'common.php';
	$link = mysqli_connect($db_hostname, $db_username, $db_password, $db_database);

    if (mysqli_connect_errno()) {
        printf("Connect failed: %s\n", mysqli_connect_error());
    }

	date_default_timezone_set('America/New_York');
	if (isset($_GET['date']) && isset($_GET['house']))
	{
		$date = get_post($link, 'date');
		$year = date_format(date_create($date), 'Y');
		$house = get_post($link, 'house');
		if (($house != 'NULL') && (strlen($year) == 4)) {
			get_data($link, $house, $year);
		}
		else {
			echo "{ 'error' : 'date and/or house parameter not valid' }";
		}
	}
	else 
	{
		echo "{ 'error' : 'date and/or house parameter not found' }"; 
	}

function get_data($link, $house, $year) {
	echo ")]}',\n ";
	/*  
	SELECT SUM(e.solar), SUM(e.used), SUM(e.adjusted_load), SUM(t.hdd)
	FROM energy_monthly e
		LEFT JOIN hdd_monthly t ON e.date = t.date AND e.house_id = t.house_id 
	WHERE e.house_id = 0 
		AND YEAR(e.date) = 2012;
	 * */
	// 0) table totals
	$query = "SELECT SUM(e.used), SUM(e.solar), SUM(e.adjusted_load), SUM(t.hdd) FROM energy_monthly e LEFT JOIN hdd_monthly t ON e.date = t.date AND e.house_id = t.house_id WHERE e.house_id = $house AND YEAR(e.date) = $year;";

	/*
	SELECT e.date, SUM(e.solar), SUM(e.used), SUM(e.adjusted_load), SUM(t.hdd)
	FROM energy_monthly e
		LEFT JOIN hdd_monthly t ON e.date = t.date AND e.house_id = t.house_id 
	WHERE e.house_id = 0 
		AND YEAR(e.date) = 2012
	GROUP BY MONTH(e.date)
	ORDER BY date;
	 * */
	// 1) table data
	$query .= "SELECT e.date, SUM(e.used), SUM(e.solar), SUM(e.adjusted_load), SUM(t.hdd) FROM energy_monthly e LEFT JOIN hdd_monthly t ON e.date = t.date AND e.house_id = t.house_id WHERE e.house_id = $house AND YEAR(e.date) = $year GROUP BY MONTH(e.date) ORDER BY e.date;";

	// $output = new Output( array( "date", "used", "solar", "net", "hdd" ) );
	$output = @new Output();
	
	if (mysqli_multi_query($link, $query)) 
	{
		$j = 0;
		do 
		{
			if ($result = mysqli_store_result($link)) 
			{
				if ($j == 0)
				{
					// $output->setTotals( mysqli_fetch_row($result) );
					$output->insertObject( 'totals', array( "used","solar", "net", "hdd" ), mysqli_fetch_row($result) );
				}
				else 
				{
					while ($row = mysqli_fetch_row($result)) 
					{
						// $output->setMonth( $row );
						$output->insertObjectInArray( 'months', array( 'date', "used","solar", "net", "hdd" ), $row );
					}	
				}
				mysqli_free_result($result);
			}
			/* go to next query */
			if (mysqli_more_results($link)) 
			{
				$j++;
			}
		} while (mysqli_next_result($link));
	} 	
	mysqli_close($link);

	echo json_encode( $output->printOutput() );
}
	
?>