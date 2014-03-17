<?php
    // monthly_generation
    
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
	
	// 0 and 1) max solar hour and day
	$query .= "SELECT solar, date FROM energy_hourly WHERE solar = (SELECT MIN(solar) FROM energy_hourly WHERE house_id = $house AND YEAR(date) = $year);";
	$query .= "SELECT solar, date FROM energy_daily WHERE solar = (SELECT MIN(solar) FROM energy_daily WHERE house_id = $house AND YEAR(date) = $year);";
	// 2) totals
	/*
	SELECT SUM(en.solar), SUM(es.solar) 
	FROM energy_monthly en 
		LEFT JOIN estimated_monthly es ON en.date = es.date AND en.house_id = es.house_id 
	WHERE en.house_id = 0
		AND YEAR(en.date) = 2012;
	 * */
	$query .= "SELECT SUM(en.solar), SUM(es.solar) FROM energy_monthly en LEFT JOIN estimated_monthly es ON en.date = es.date AND en.house_id = es.house_id WHERE en.house_id = $house AND YEAR(en.date) = $year;";
	
	// 3) list by month
	/*
	SELECT en.date, SUM(en.solar), SUM(es.solar) 
	FROM energy_monthly en 
		LEFT JOIN estimated_monthly es ON en.date = es.date AND en.house_id = es.house_id 
	WHERE en.house_id = 0
		AND YEAR(en.date) = 2012
	GROUP BY MONTH(en.date)
	ORDER BY en.date;
	 * */
	$query .= "SELECT en.date, SUM(en.solar), SUM(es.solar) FROM energy_monthly en LEFT JOIN estimated_monthly es ON en.date = es.date AND en.house_id = es.house_id WHERE en.house_id = $house AND YEAR(en.date) = $year GROUP BY MONTH(en.date) ORDER BY en.date;";

	$output = new Output( array( "date", "actual", "estimated" ) );
	
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
						$output->insertObject("max_solar_hour", array("kWh", "date"), mysqli_fetch_row($result) );
						break;
					case(1):
						$output->insertObject("max_solar_day", array("kWh", "date"), mysqli_fetch_row($result) );
						break;
					case(2):
						$output->setTotals( mysqli_fetch_row($result) );
						break;
					case(3):
						while ($row = mysqli_fetch_row($result)) 
						{
							$output->setMonth( $row );
						}	
				}
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