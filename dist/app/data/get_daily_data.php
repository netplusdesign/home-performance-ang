<?php
	// get_daily_data.php
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
		$month = date_format(date_create($date), 'm');
		$house = get_post($link, 'house');
		if (($house != 'NULL') && (strlen($year) == 4)) {
			get_data($link, $house, $year, $month);
		}
		else {
			echo "{ 'error' : 'date and/or house parameter not valid' }";
		}
	}
	else 
	{
		echo "{ 'error' : 'date and/or house parameter not found' }"; 
	}

	function get_data($link, $house, $year, $month) {
		echo ")]}',\n ";
		
			/*
		SELECT tu.date, e.adjusted_load, e.solar, e.used, tu.outdoor_deg_min, tu.outdoor_deg_max, th.hdd, e.water_heater, e.ashp, e.water_pump, e.dryer, e.washer, e.dishwasher, e.stove
		FROM (SELECT house_id, date, temperature_min AS 'outdoor_deg_min', temperature_max AS 'outdoor_deg_max' FROM temperature_daily WHERE device_id = 0) tu 
			LEFT JOIN (SELECT house_id, date, hdd FROM hdd_daily) th ON th.date = tu.date AND th.house_id = tu.house_id
			LEFT JOIN energy_daily e ON e.date = tu.date AND e.house_id = tu.house_id
		WHERE tu.house_id = 0
			AND YEAR(tu.date) = 2012
			AND MONTH(tu.date) = 3;
			 * */
	    $query = "SELECT tu.date, e.adjusted_load, e.solar, e.used, ";
	    $query .= "tu.outdoor_deg_min, tu.outdoor_deg_max, th.hdd, ";
	    $query .= "e.water_heater, e.ashp, e.water_pump, e.dryer, e.washer, e.dishwasher, e.stove, ";
		$query .= "e.used-(e.water_heater+e.ashp+e.water_pump+e.dryer+e.washer+e.dishwasher+e.stove) AS 'All other circuits' ";
		$query .= "FROM (SELECT house_id, date, temperature_min AS 'outdoor_deg_min', temperature_max AS 'outdoor_deg_max' FROM temperature_daily WHERE device_id = 0) tu ";
		$query .= "LEFT JOIN (SELECT house_id, date, hdd FROM hdd_daily) th ON th.date = tu.date AND th.house_id = tu.house_id ";
		$query .= "LEFT JOIN energy_daily e ON e.date = tu.date AND e.house_id = tu.house_id ";
		$query .= "WHERE tu.house_id = $house ";
		$query .= "AND YEAR(tu.date) = $year ";
		$query .= "AND MONTH(tu.date) = $month;";
		
		$output = @new Output();
		
		if ($result = mysqli_query($link, $query))
		{ 
			while ($row = mysqli_fetch_row($result)) 
			{ 
				$output->insertObjectInArray( 'days', array( 'date', 'netusage', 'generation', 'usage', 'templow', 'temphigh', 'hdd', 'water_heater', 'ashp', 'water_pump', 'dryer', 'washer', 'dishwasher', 'range', 'all_other' ), $row );
			}
			mysqli_free_result($result);
		}
		mysqli_close($link);
	
		echo json_encode( $output->printOutput() );
	}
?>