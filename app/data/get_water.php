<?php
    // monthly_water
    
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
	
	// 0 totals and 1) list by month
	/* 
	SELECT SUM(main.gallons)-SUM(hot.gallons), SUM(hot.gallons), SUM(main.gallons), SUM(e.water_heater), SUM(e.water_pump) 
	FROM energy_monthly e 
		LEFT JOIN (SELECT house_id, date, gallons FROM water_monthly WHERE device_id = 6) main ON e.date = main.date AND main.house_id = e.house_id 
		LEFT JOIN (SELECT house_id, date, gallons FROM water_monthly WHERE device_id = 7) hot ON e.date = hot.date AND hot.house_id = e.house_id
	WHERE e.house_id = 0
		AND YEAR(e.date) = 2012;
	 * */
$query = <<<_QUERY
SELECT SUM(main.gallons)-SUM(hot.gallons), SUM(hot.gallons), SUM(main.gallons), SUM(e.water_heater), SUM(e.water_pump)
FROM energy_monthly e
  LEFT JOIN (SELECT house_id, date, gallons FROM water_monthly WHERE device_id = 6) main ON e.date = main.date AND main.house_id = e.house_id
  LEFT JOIN (SELECT house_id, date, gallons FROM water_monthly WHERE device_id = 7) hot ON e.date = hot.date AND hot.house_id = e.house_id
WHERE e.house_id = $house
  AND YEAR(e.date) = $year;
_QUERY;

	/*
	SELECT e.date, SUM(main.gallons)-SUM(hot.gallons), SUM(hot.gallons), SUM(main.gallons), SUM(e.water_heater), SUM(e.water_pump) 
	FROM energy_monthly e 
		LEFT JOIN (SELECT house_id, date, gallons FROM water_monthly WHERE device_id = 6) main ON e.date = main.date AND main.house_id = e.house_id 
		LEFT JOIN (SELECT house_id, date, gallons FROM water_monthly WHERE device_id = 7) hot ON e.date = hot.date AND hot.house_id = e.house_id 
	WHERE e.house_id = 0
		AND YEAR(e.date) = 2012
	GROUP BY MONTH(e.date)
	ORDER BY date;
	 * */
$query .= <<<_QUERY
SELECT e.date, SUM(main.gallons)-SUM(hot.gallons), SUM(hot.gallons), SUM(main.gallons), SUM(e.water_heater), SUM(e.water_pump)
FROM energy_monthly e
  LEFT JOIN (SELECT house_id, date, gallons FROM water_monthly WHERE device_id = 6) main ON e.date = main.date AND main.house_id = e.house_id
  LEFT JOIN (SELECT house_id, date, gallons FROM water_monthly WHERE device_id = 7) hot ON e.date = hot.date AND hot.house_id = e.house_id
WHERE e.house_id = $house
  AND YEAR(e.date) = $year
GROUP BY MONTH(e.date)
ORDER BY e.date;
_QUERY;
	
	$output = new Output( array( "date", "cold", "hot", "main", "water_heater", "water_pump" ) );
	
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
						$output->setTotals( mysqli_fetch_row($result) );
						break;
					case(1):
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