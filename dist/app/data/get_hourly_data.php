<?php
	require_once 'login.php';
	require_once 'common.php';
	$link = mysqli_connect($db_hostname, $db_username, $db_password, $db_database);

    if (mysqli_connect_errno()) {
        printf("Connect failed: %s\n", mysqli_connect_error());
    }

	date_default_timezone_set('America/New_York');
	if (isset($_GET['date']) && isset($_GET['house']))
	{
		$date = date_format(date_create( get_post($link, 'date') ), 'Y-m-d');
		$house = get_post($link, 'house');
		if (($house != 'NULL') && (strlen($date) == 10)) {
			get_data($link, $house, $date);
		}
		else {
			echo "{ 'error' : 'date and/or house parameter not valid' }";
		}
	}
	else 
	{
		echo "{ 'error' : 'date and/or house parameter not found' }"; 
	}

	function get_data($link, $house, $date) {
		echo ")]}',\n ";
		
		/*
SELECT ti1.date, e.adjusted_load, e.solar, e.used, ti1.indoor1_deg, ti2.indoor2_deg, ti0.indoor0_deg, 
  tu.outdoor_deg, th.hdd, e.water_heater, e.ashp, e.water_pump, e.dryer, e.washer, e.dishwasher, e.stove,
  e.used-(e.water_heater+e.ashp+e.water_pump+e.dryer+e.washer+e.dishwasher+e.stove) AS 'All other circuits'
FROM (SELECT house_id, date, temperature AS 'indoor1_deg' FROM temperature_hourly WHERE device_id = 1) ti1
  LEFT JOIN (SELECT house_id, date, temperature AS 'indoor2_deg' FROM temperature_hourly WHERE device_id = 2) ti2 
	ON CAST(LEFT(ti2.date,13) AS DATETIME) = CAST(LEFT(ti1.date,13) AS DATETIME) AND ti2.house_id = ti1.house_id
  LEFT JOIN (SELECT house_id, date, temperature AS 'indoor0_deg' FROM temperature_hourly WHERE device_id = 3) ti0 
	ON CAST(LEFT(ti0.date,13) AS DATETIME) = CAST(LEFT(ti1.date,13) AS DATETIME) AND ti0.house_id = ti1.house_id
  LEFT JOIN (SELECT house_id, date, temperature AS 'outdoor_deg' FROM temperature_hourly WHERE device_id = 0) tu 
	ON CAST(LEFT(tu.date,13) AS DATETIME) = CAST(LEFT(ti1.date,13) AS DATETIME) AND tu.house_id = ti1.house_id
  LEFT JOIN (SELECT house_id, date, hdd FROM hdd_hourly) th 
	ON CAST(LEFT(th.date,13) AS DATETIME) = CAST(LEFT(ti1.date,13) AS DATETIME) AND th.house_id = ti1.house_id
  LEFT JOIN energy_hourly e 
	ON CAST(LEFT(e.date,13) AS DATETIME) = CAST(LEFT(ti1.date,13) AS DATETIME) AND e.house_id = ti1.house_id
WHERE CAST(ti1.date AS DATE) = DATE('2014-02-07')
  AND ti1.house_id = 0
ORDER BY e.date;
		 * */
		
	    $query = "SELECT ti1.date, e.adjusted_load, e.solar, e.used, ";
	    $query .= "ti1.indoor1_deg, ti2.indoor2_deg, ti0.indoor0_deg, tu.outdoor_deg, th.hdd, ";
	    $query .= "e.water_heater, e.ashp, e.water_pump, e.dryer, e.washer, e.dishwasher, e.stove, ";
		$query .= "e.used-(e.water_heater+e.ashp+e.water_pump+e.dryer+e.washer+e.dishwasher+e.stove) AS 'All other' ";
		$query .= "FROM (SELECT house_id, date, temperature AS 'indoor1_deg' FROM temperature_hourly WHERE device_id = 1) ti1 ";
		$query .= "LEFT JOIN (SELECT house_id, date, temperature AS 'indoor2_deg' FROM temperature_hourly WHERE device_id = 2) ti2 ";
		$query .= "ON CAST(LEFT(ti2.date,13) AS DATETIME) = CAST(LEFT(ti1.date,13) AS DATETIME) AND ti2.house_id = ti1.house_id ";
		$query .= "LEFT JOIN (SELECT house_id, date, temperature AS 'indoor0_deg' FROM temperature_hourly WHERE device_id = 3) ti0 ";
		$query .= "ON CAST(LEFT(ti0.date,13) AS DATETIME) = CAST(LEFT(ti1.date,13) AS DATETIME) AND ti0.house_id = ti1.house_id ";
		$query .= "LEFT JOIN (SELECT house_id, date, temperature AS 'outdoor_deg' FROM temperature_hourly WHERE device_id = 0) tu ";
		$query .= "ON CAST(LEFT(tu.date,13) AS DATETIME) = CAST(LEFT(ti1.date,13) AS DATETIME) AND tu.house_id = ti1.house_id ";
		$query .= "LEFT JOIN (SELECT house_id, date, hdd FROM hdd_hourly) th ";
		$query .= "ON CAST(LEFT(th.date,13) AS DATETIME) = CAST(LEFT(ti1.date,13) AS DATETIME) AND th.house_id = ti1.house_id ";
		$query .= "LEFT JOIN energy_hourly e ";
		$query .= "ON CAST(LEFT(e.date,13) AS DATETIME) = CAST(LEFT(ti1.date,13) AS DATETIME) AND e.house_id = ti1.house_id ";
		$query .= "WHERE CAST(ti1.date AS DATE) = DATE('$date') ";
		$query .= "AND ti1.house_id = $house ";
		$query .= "ORDER BY e.date;";
		
		$output = @new Output();
		
		if ($result = mysqli_query($link, $query))
		{
			//echo "Time,Adjusted Load,Solar,Usage,First Floor Temp,Second Floor Temp,Basement Temp,Outdoor Temp,HDD,Water Heater,ASHP,Water Pump,Dryer,Washer,Dishwasher,Range,All Other\r\n"; 
			while ($row = mysqli_fetch_row($result)) 
			{
				//echo date_format(date_create($row[0]), 'H') . "," . $row[1] . "," . $row[2] . "," . $row[3] . "," . $row[4] . "," . $row[5] . ",";
				//echo $row[6] . "," . $row[7] . "," . $row[8] . "," . $row[9] . "," . $row[10] . "," . $row[11] . "," . $row[12] . "," . $row[13] . "," . $row[14] . "," . $row[15] . "," . $row[16] . "\r\n";
				$output->insertObjectInArray( 'hours', array( 'date', 'netusage', 'generation', 'usage', 'first_floor_temp', 'second_floor_temp', 'basement_temp', 'outdoor_temp', 'hdd', 'water_heater', 'ashp', 'water_pump', 'dryer', 'washer', 'dishwasher', 'range', 'all_other' ), $row );
			}
			mysqli_free_result($result);
		}
		mysqli_close($link);
		
		echo json_encode( $output->printOutput() );
	
	}
?>