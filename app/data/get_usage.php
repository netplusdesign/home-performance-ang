<?php
    // get_monthly_usage.php
    
    require_once 'login.php';
	require_once 'common.php';
	$link = mysqli_connect( $db_hostname, $db_username, $db_password, $db_database );

    if ( mysqli_connect_errno() ) {
        printf( "Connect failed: %s\n", mysqli_connect_error() );
    }

	date_default_timezone_set( 'America/New_York' );
	if ( isset( $_GET['date'] ) && isset( $_GET['house'] ) )
	{
		$date = get_post($link, 'date');
		$year = date_format(date_create($date), 'Y');
		$house = get_post($link, 'house');
		$circuit = get_post($link, 'circuit');
		
		if ( ($circuit == 'NULL') || ( strlen( $circuit ) == 0 ) ) {
			$circuit = 'summary';
		}
		
		if (( $house != 'NULL' ) && ( strlen( $year ) == 4 )) {
			get_data( $link, $house, $year, $circuit );
		}
		else {
			echo "{ 'error' : 'date and/or house parameter not valid' }";
		}		
	}
	else 
	{
		echo "{ 'error' : 'date and/or house parameter not found' }";  
	}

function get_data($link, $house, $year, $circuit) {
	
	echo ")]}',\n ";
	
	if ( $circuit == 'summary' )
	{
		// =====================
	 	// all circuits - totals
		// for all circuits
		//$circuits = array("Water heater", "ASHP", "Water pump", "Dryer", "Washer", "Dishwasher", "Range", "All other");
		$output = new Output( array( "date", "all_circuits", "water_heater", "ashp", "water_pump", "dryer", "washer", "dishwasher", "range", "all_other" ) );
	 	// 0) list total by circuit	
		/*
SELECT SUM(used) AS used, 
	SUM(water_heater) AS water_heater, 
	SUM(ashp) AS ashp, 
	SUM(water_pump) AS water_pump, 
	SUM(dryer) AS dryer, 
	SUM(washer) AS washer, 
	SUM(dishwasher) AS dishwasher, 
	SUM(stove) AS stove, 
	SUM(used)-(SUM(water_heater)+SUM(ashp)+SUM(water_pump)+SUM(dryer)+SUM(washer)+SUM(dishwasher)+SUM(stove)) AS all_other 
FROM energy_monthly 
WHERE house_id = 0
AND YEAR(date) = 2014 
AND (device_id = 5 OR device_id = 10);
		 * */
		$query = "SELECT SUM(used), SUM(water_heater), SUM(ashp), SUM(water_pump), SUM(dryer), SUM(washer), SUM(dishwasher), SUM(stove), SUM(used)-(SUM(water_heater)+SUM(ashp)+SUM(water_pump)+SUM(dryer)+SUM(washer)+SUM(dishwasher)+SUM(stove)) FROM energy_monthly WHERE house_id = $house AND YEAR(date) = $year AND (device_id = 5 OR device_id = 10);";
	}
	elseif ( $circuit == 'all' )
	{
		// ==================================
		// drill down to monthly all circuits	
		$circuit_title = "Total";
		$output = new Output( array( "date", "actual", "budget" ) );
		// 2) all circuits, budget total
		/*
		SELECT SUM(a.used) AS 'Actual', SUM(b.used) AS 'Budget' 
		FROM energy_monthly a, estimated_monthly b  
		WHERE a.house_id = 0
			AND YEAR(a.date) = 2012
		 	AND a.date = b.date;
		 * */
		$query = "SELECT SUM(a.used), SUM(b.used) FROM energy_monthly a, estimated_monthly b WHERE a.house_id = $house AND YEAR(a.date) = $year AND a.date = b.date;";
	
		// 3) all circuits totals by month
		/*
		SELECT a.date, SUM(a.used) AS 'Actual', SUM(b.used) AS 'Budget'
		FROM energy_monthly a, estimated_monthly b
		WHERE a.house_id = 0
			AND YEAR(a.date) = 2012
			AND a.date = b.date 
		GROUP BY MONTH(a.date) 
		ORDER BY a.date;
		 * */
		$query .= "SELECT a.date, SUM(a.used), SUM(b.used) FROM energy_monthly a, estimated_monthly b WHERE a.house_id = $house AND YEAR(a.date) = $year AND a.date = b.date GROUP BY MONTH(a.date) ORDER BY a.date;";
	}
	elseif( $circuit == 'ashp' )
	{
		// ==================
		// drill down to ASHP
		$base = 50;
		$circuit_title = "ASHP";
		$output = new Output( array( "date", "actual", "hdd" ) );
		// total
$query .= <<<_QUERY
SELECT SUM(e.ashp), SUM(t.hdd)
FROM 
  (SELECT date, SUM( IF( (($base - temperature) / 24) > 0, (($base - temperature) / 24), 0) ) AS 'hdd' 
    FROM temperature_hourly
    WHERE house_id = $house 
      AND YEAR(date) = $year
      AND device_id = 0 
    GROUP BY MONTH(date), DAY(date) ) t,
  (SELECT date, ashp
    FROM energy_daily 
    WHERE house_id = $house
      AND YEAR(date) = $year
      AND (device_id = 5 OR device_id = 10) ) e
WHERE t.date = e.date;
_QUERY;
		
		// 4) get monthly values plus HDD data to calculate projected values
$query .= <<<_QUERY
SELECT e.date, e.ashp, SUM( IF( (($base - t.temperature) / 24) > 0, (($base - t.temperature) / 24), 0) ) AS 'hdd' 
FROM temperature_hourly t, 
  (SELECT date, ashp FROM energy_monthly WHERE house_id = $house AND YEAR(date) = $year AND (device_id = 5 OR device_id = 10)) e 
WHERE t.device_id = 0 
  AND t.house_id = $house
  AND YEAR(t.date) = $year 
  AND MONTH(e.date) = MONTH(t.date)
  GROUP BY MONTH(t.date);
_QUERY;

	}
	elseif( $circuit == 'all_other' )
	{
		// ===================================	
		// 1) drill down to all other circuits
		$circuit_title = "All other";
		$output = new Output( array( "date", "actual" ) );
		// total
		$query = "SELECT SUM(used)-(SUM(water_heater)+SUM(ashp)+SUM(water_pump)+SUM(dryer)+SUM(washer)+SUM(dishwasher)+SUM(stove)) FROM energy_monthly WHERE house_id = $house AND YEAR(date) = $year AND (device_id = 5 OR device_id = 10);";
		/*
		SELECT date, SUM(used)-(SUM(water_heater)+SUM(ashp)+SUM(water_pump)+SUM(dryer)+SUM(washer)+SUM(dishwasher)+SUM(stove)) 
		FROM energy_monthly 
		WHERE house_id = 0
			AND YEAR(date) = 2012 
			AND (device_id = 5 OR device_id = 10) 
		GROUP BY MONTH(date);
		 * */		
		$query .= "SELECT date, SUM(used)-(SUM(water_heater)+SUM(ashp)+SUM(water_pump)+SUM(dryer)+SUM(washer)+SUM(dishwasher)+SUM(stove)) FROM energy_monthly WHERE house_id = $house AND YEAR(date) = $year AND (device_id = 5 OR device_id = 10) GROUP BY MONTH(date);";
	}
	else
	{
		if ($circuit == 'range') $circuit = 'stove'; // ugly workaround, part 1
		// =======================
		// drill down to circuit x
		$circuits = array(
			"water_heater" => "Water heater",
			"water_pump" => "Water pump",
			"dryer" => "Dryer",
			"washer" => "Washer",
			"dishwasher" => "Dishwasher",
			"stove" => "Range",
		);
		$circuit_title = $circuits[$circuit];
		$output = new Output( array( "date", "actual" ) );
		// 5x) circuit total
		$query = "SELECT SUM($circuit) FROM energy_monthly WHERE house_id = $house AND YEAR(date) = $year AND (device_id = 5 OR device_id = 10);";
		// 6x) circuit by month
		$query .= "SELECT date, $circuit FROM energy_monthly WHERE house_id = $house AND YEAR(date) = $year AND (device_id = 5 OR device_id = 10) GROUP BY MONTH(date);";
	}
	if ($circuit == 'stove') $circuit = 'range'; // ugly workaround, part 2
	
	$output->insertObject( "circuit", array('name', 'title'), array($circuit, $circuit_title) );
	
	if ( mysqli_multi_query($link, $query )) {
		if ( $circuit == 'summary' ) {
			if ( $result = mysqli_store_result( $link ) ) {
				$columns = mysqli_fetch_row( $result );
				$objNames = array( "all", "water_heater", "ashp", "water_pump", "dryer", "washer", "dishwasher", "range", "all_other" );
				$names = array( "Total", "Water heater", "ASHP", "Water pump", "Dryer", "Washer", "Dishwasher", "Range", "All other" );
				$arrNames = array( "name", "title", "actual" );
				for ($i = 0; $i < count( $columns ); $i++)
				{
					$output->insertObjectInArray( 'circuits', $arrNames, array( $objNames[$i], $names[$i], $columns[$i] ) );
				}
			}
		}
		else {
			$j = 0;
			do 
			{
				if ($result = mysqli_store_result($link)) 
				{
					switch($j)
					{
						case(0):
							$output->setTotals( mysqli_fetch_row( $result ) );
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
	} 	
	mysqli_close($link);

	echo json_encode( $output->printOutput() );
}
?>