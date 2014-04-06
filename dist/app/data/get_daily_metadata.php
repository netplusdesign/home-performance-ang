<?php
	// get_daily_metadata.php
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
		/*
		SELECT MIN(e.date), MAX(e.date) 
		FROM energy_daily e, temperature_daily t 
		WHERE e.house_id = 0 
			AND e.date = t.date 
		UNION 
		SELECT MIN(e.date), MAX(e.date) 
		FROM energy_daily e, temperature_daily t 
		WHERE e.house_id = 0 
			AND e.date = t.date 
			AND water_heater IS NOT NULL;
		 * */
		$query = "SELECT MIN(e.date), MAX(e.date) FROM energy_daily e, temperature_daily t WHERE e.house_id = $house AND e.date = t.date UNION SELECT MIN(e.date), MAX(e.date) FROM energy_daily e, temperature_daily t WHERE e.house_id = $house AND e.date = t.date AND water_heater IS NOT NULL;";

		/* 
		SELECT used_max, solar_min, outdoor_deg_min, outdoor_deg_max, hdd_max 
		FROM limits_hourly
		WHERE house_id = 0;
		 *  */
		$query .= "SELECT used_max, solar_min, outdoor_deg_min, outdoor_deg_max, hdd_max FROM limits_hourly WHERE house_id = $house;";
		
		$output = @new Output();
			
		if ($result = mysqli_multi_query($link, $query))
		{
			do 
			{
				if ($result = mysqli_store_result($link)) 
				{
					switch($j++)
					{
						case(0):
							$output->insertObject("daily_date_range", array("start", "end"), mysqli_fetch_row($result) );
							$output->insertObject("circuit_date_range", array("start", "end"), mysqli_fetch_row($result) );
							break;
						case(1):
							$output->insertObject("limits", array("used_max", "solar_min", "outdoor_deg_min", "outdoor_deg_max", "hdd_max"), mysqli_fetch_row($result) );
					}
					mysqli_free_result($result);
				}
			} while (mysqli_next_result($link));
		}
		mysqli_close($link);
		
		echo json_encode( $output->printOutput() );
	}
?>