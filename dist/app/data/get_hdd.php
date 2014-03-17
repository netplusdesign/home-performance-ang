<?php
    // get_monthly_hdd.php
    
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
SELECT SUM(e.ashp) AS 'totals.ashp', SUM(h.hdd) AS 'totals.hdd_for_ashp'
FROM hdd_daily h, energy_daily e
WHERE YEAR(e.date) = 2012
AND e.house_id = 0
AND h.house_id = 0
AND (MONTH(h.date) < 5
OR MONTH(h.date) > 9)
AND h.date = e.date
AND e.ashp IS NOT NULL;
	 * 	 * */
	// 0) returns total HDD and total kWh used in heating season, for Wh/SF/HDD calculation
	// is not null is needed to ensure only hdds are summed for days that we have circuit data for ashp 
$query = <<<_QUERY
SELECT SUM(e.ashp) AS 'totals.ashp_heating_season', SUM(h.hdd) AS 'totals.hdd_heating_season'
FROM hdd_daily h, energy_daily e
WHERE YEAR(e.date) = $year
AND e.house_id = $house
AND h.house_id = $house
AND (MONTH(h.date) < 5
OR MONTH(h.date) > 9)
AND h.date = e.date
AND e.ashp IS NOT NULL;
_QUERY;

	// 1 and 2) coldest temp and date, coldest day hdd and date
	/*
	 * 1) SELECT temperature, date FROM temperature_hourly WHERE temperature = (SELECT MIN(temperature) FROM temperature_hourly WHERE YEAR(date) = 2012) AND house_id = 0;
	 * 2) SELECT hdd, date FROM hdd_daily WHERE hdd = (SELECT MAX(hdd) FROM hdd_daily WHERE YEAR(date) = 2012) AND house_id = 0; 
	 * */
	$query .= "SELECT temperature, date FROM temperature_hourly WHERE temperature = (SELECT MIN(temperature) FROM temperature_hourly WHERE YEAR(date) = $year) AND house_id = $house;";
	$query .= "SELECT hdd, date FROM hdd_daily WHERE hdd = (SELECT MAX(hdd) FROM hdd_daily WHERE YEAR(date) = $year) AND house_id = $house;";

	/*
	SELECT iga FROM houses WHERE house_id = 0;
	 * */
	// 3) IGA
	$query .= "SELECT iga FROM houses WHERE house_id = $house;";
	
	/*
	SELECT SUM(td.hdd), SUM(es.hdd) 
	FROM hdd_monthly td, estimated_monthly es 
	WHERE td.house_id = 0
		AND td.house_id = es.house_id
		AND td.date = es.date
		AND YEAR(es.date) = 2012;
	 * */
	// 4) total hdd and total estimated hdd
	$query .= "SELECT SUM(td.hdd), SUM(es.hdd) FROM hdd_monthly td, estimated_monthly es WHERE td.house_id = $house AND td.house_id = es.house_id AND td.date = es.date AND YEAR(es.date) = $year;";
	
	/*
	SELECT es.date, td.hdd, es.hdd
	FROM hdd_monthly td, estimated_monthly es
	WHERE td.house_id = 0
		AND td.house_id = es.house_id
		AND td.date = es.date
		AND YEAR(td.date) = 2012
	ORDER BY td.date;
	 * */
	// 5) list by month
	$query .= "SELECT es.date, td.hdd, es.hdd FROM hdd_monthly td, estimated_monthly es WHERE td.house_id = $house AND td.house_id = es.house_id AND td.date = es.date AND YEAR(td.date) = $year ORDER BY td.date;";

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
						$output->insertObject("totals", array("ashp_heating_season", "hdd_heating_season"), mysqli_fetch_row($result) );
						break;
					case(1):
						$output->insertObject("coldest_hour", array("temperature", "date"), mysqli_fetch_row($result) );
						break;
					case(2):
						$output->insertObject("coldest_day", array("temperature", "date"), mysqli_fetch_row($result) );
						break;
					case(3):
						$r = mysqli_fetch_row($result);
						$output->insertProp("iga", $r[0] ); 
						break;
					case(4):
						$output->insertPropsInObject("totals", array("actual", "estimated"), mysqli_fetch_row($result) );
						break;
					case(5):
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