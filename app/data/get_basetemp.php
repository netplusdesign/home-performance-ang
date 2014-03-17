<?php
    // get hdd and kwh
    require_once 'login.php';
	require_once 'common.php';
	$link = mysqli_connect($db_hostname, $db_username, $db_password, $db_database);

    if (mysqli_connect_errno()) {
        printf("Connect failed: %s\n", mysqli_connect_error());
    }
	
	date_default_timezone_set('America/New_York');
	if (isset($_GET['base']) && isset($_GET['period']) && isset($_GET['house']) && isset($_GET['date']))
	{
		$base = get_post($link, 'base');
		$period = get_post($link, 'period');
		$house = get_post($link, 'house');
		$year = date_format(date_create( get_post($link, 'date') ), 'Y');
		if (($house != 'NULL') && (strlen($year) == 4)) {
			get_data($link, $house, $year, $base, $period);
		}
		else {
			echo "{ 'error' : 'date and/or house parameter not valid' }";
		}
	} 
	else 
	{
		echo "{ 'error' : 'date and/or house parameter not found' }";
	}
	
function get_data($link, $house, $year, $base, $period) {
	echo ")]}',\n ";
	
	/*
	SELECT (54.0 - t.temperature) / 24 AS 'hdd', e.ashp/1000.0, t.temperature, e.date, e.solar/1000.0
	FROM (SELECT date, solar, ashp FROM energy_hourly WHERE house_id = 0 AND YEAR(date) = 2012 AND solar > -500 AND ashp > 0) e 
		 LEFT JOIN (SELECT date, temperature FROM temperature_hourly WHERE house_id = 0 AND device_id = 0 AND YEAR(date) = 2012 AND temperature <= 54) t ON e.date = t.date
	WHERE e.date = t.date;
	 * */
	// hourly
	$query['hours'] = "SELECT e.date, hdd, e.ashp/1000.0, t.temperature, e.solar/1000.0 "; 
	$query['hours'] .= "FROM (SELECT date, solar, ashp FROM energy_hourly WHERE house_id = $house AND YEAR(date) = $year AND solar > -500 AND ashp > 0) e ";
	$query['hours'] .= "LEFT JOIN (SELECT date, temperature, ($base - temperature) / 24 AS 'hdd' FROM temperature_hourly WHERE house_id = $house AND device_id = 0 AND YEAR(date) = $year AND temperature <= $base) t ON e.date = t.date ";
	$query['hours'] .= "WHERE e.date = t.date ";

	/*
	SELECT SUM(t.hdd), SUM(e.ashp)/1000.0, AVG(t.temperature), e.date, SUM(e.solar)/1000.0
	FROM (SELECT date, solar, ashp FROM energy_hourly WHERE house_id = 0 AND YEAR(date) = 2012 AND solar > -500 AND ashp > 0) e
		 LEFT JOIN (SELECT date, temperature, (54 - temperature) / 24 AS 'hdd' FROM temperature_hourly WHERE house_id = 0 AND device_id = 0 AND YEAR(date) = 2012 AND temperature <= 54) t ON e.date = t.date
	WHERE e.date = t.date 
	GROUP BY CAST(t.date AS DATE);
	 * */
	// daily
	$query['days'] = "SELECT e.date, SUM(t.hdd), SUM(e.ashp)/1000.0, AVG(t.temperature), SUM(e.solar)/1000.0 "; 
	$query['days'] .= "FROM (SELECT date, solar, ashp FROM energy_hourly WHERE house_id = $house AND YEAR(date) = $year AND solar > -500 AND ashp > 0) e ";
	$query['days'] .= "LEFT JOIN (SELECT date, temperature, ($base - temperature) / 24 AS 'hdd' FROM temperature_hourly WHERE house_id = $house AND device_id = 0 AND YEAR(date) = $year AND temperature <= $base) t ON e.date = t.date ";
	$query['days'] .= "WHERE e.date = t.date ";
	$query['days'] .= "GROUP BY CAST(t.date AS DATE) ";
	
	/*
	SELECT SUM(t.hdd), SUM(e.ashp)/1000.0, AVG(t.temperature), e.date, SUM(e.solar)/1000.0
	FROM (SELECT date, solar, ashp FROM energy_hourly WHERE house_id = 0 AND YEAR(date) = 2013 AND solar > -500 AND ashp > 0) e
		 LEFT JOIN (SELECT date, temperature, (54 - temperature) / 24 AS 'hdd' FROM temperature_hourly WHERE house_id = 0 AND device_id = 0 AND YEAR(date) = 2013 AND temperature <= 54) t ON e.date = t.date
	WHERE t.date = e.date 
	GROUP BY MONTH(t.date);
	*/
	// monthly
	$query['months'] = "SELECT e.date, SUM(t.hdd), SUM(e.ashp)/1000.0, AVG(t.temperature), SUM(e.solar)/1000.0 "; 
	$query['months'] .= "FROM (SELECT date, solar, ashp FROM energy_hourly WHERE house_id = $house AND YEAR(date) = $year AND solar > -500 AND ashp > 0) e ";
	$query['months'] .= "LEFT JOIN (SELECT date, temperature, ($base - temperature) / 24 AS 'hdd' FROM temperature_hourly WHERE house_id = $house AND device_id = 0 AND YEAR(date) = $year AND temperature <= $base) t ON e.date = t.date ";
	$query['months'] .= "WHERE e.date = t.date ";
	$query['months'] .= "GROUP BY MONTH(t.date) ";	
	
	$output = @new Output();
	$output->insertProp("period", $period );
	
	if ($result = mysqli_query($link, $query[$period]))
	{ 
		while ($row = mysqli_fetch_row($result)) 
		{
			$output->insertObjectInArray ( "points", array( "date", "hdd", "ashp", "temperature", "solar" ), $row );
		}
		mysqli_free_result($result);
	}
	
	mysqli_close($link);
	
	echo json_encode( $output->printOutput() );
}	
?>