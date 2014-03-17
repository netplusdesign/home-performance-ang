<?php
    // common stuff
function get_post($link, $var)
{
	$temp = mysqli_real_escape_string($link, $_GET[$var]);
	if ($temp == '') $temp = 'NULL';
	return $temp;
}

class Output {
	public $columns = array();
	public $combined;
	public $totals; 
	public $months = array();
	private $insertedProps = array();
	private $insertedObjects = array();
	private $insertedArrays = array();
		
	public function __construct ( $params ) {	
		$this->columns = $params;
		$totals = new stdClass;
		$combined = new stdClass;
	}
		
	public function setTotals ( $totalVals ) {
		$i = 1;
		forEach($totalVals as $total) {
			$this->totals -> {$this->columns[$i]} = $total;
			$i++;
		}	
	}
	
	public function setMonth ( $monthVals ) {
		$month = new stdClass;
		$i = 0;
		foreach($monthVals as $monthVal) {
			$month -> {$this->columns[$i]} = $monthVal;
			$i++;
		}
		$this->months[] = $month;
	}
	
	//$output->insertObject( 'totals', array( 'actual' ), mysqli_fetch_row($result) );
	public function insertObject ( $objName, $names, $values ) {
		$obj = new stdClass;
		$i = 0;
		foreach($values as $value) {
			$obj -> $names[$i] = $value;
			$i++;
		}
		$this->insertedObjects[$objName] = $obj;
	}

	public function insertPropsInObject ( $objName, $names, $values ) {
		$j = 0;
		foreach($values as $value) {
			$this->insertedObjects[$objName] -> $names[$j] = $value;
			$j++;
		}
	}

	//$output->insertObjectInArray( 'months', array( 'date', 'actual' ), $row );
	public function insertObjectInArray ( $arrName, $names, $values ) {
		$newObjName = new stdClass;
		//$this->$objName = new stdClass;
		$i = 0;
		foreach($values as $value) {
			$newObjName -> $names[$i] = $value;
			$i++;
		}
		$this->insertedArrays[$arrName][] = $newObjName;
	}

	public function insertPropsInArray ( $arrName, $i, $names, $values ) {
		$j = 0;
		foreach($values as $value) {
			$this->insertedArrays[$arrName][$i] -> $names[$j] = $value;
			$j++;
		}
	}

	public function insertProp ( $name, $value ) {
		$this->insertedProps[] = $name;
		$this->$name = $value;
	}
	
	public function printOutput () {
		$this->combined -> totals = $this->totals;
		$this->combined -> months = $this->months;
		foreach( $this->insertedProps as $name ) {
			$this->combined -> $name = $this->$name;
		}
		foreach( $this->insertedObjects as $name => $value) {
			$this->combined -> $name = $value;
		}
		foreach( $this->insertedArrays as $name => $arr ) {
			$this->combined -> $name = $arr;
		}
		return $this->combined;
	}
}

?>