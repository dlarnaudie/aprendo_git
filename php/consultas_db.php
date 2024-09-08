<?php
header('Content-Type: application/json;charset= utf-8');
require("dbinfo.php");
$con = mysqli_connect($sqlname, $username, $password, $db);
if(!$con){exit;}
if($_REQUEST['sql']){$sql = $_REQUEST['sql'];}
if($_REQUEST['tipo']){$tipo = $_REQUEST['tipo'];}

    $resultado = mysqli_query($con,$sql);

if ($tipo == 'nuevo_registro'){
    $sql = "SELECT palabra, significado, explicacion, aciertos FROM dl_ingles WHERE aciertos < 20";
}

$resultado = mysqli_query($con,$sql);

    $res = array();

    if ($resultado != FALSE)
    {
        if (mysqli_num_rows($resultado) > 0){
            while($row = mysqli_fetch_assoc($resultado))
            {                         $elem = array(
                                                    'palabra'=>$row["palabra"],
                                                    'significado'=>$row["significado"],
                                                    'explicacion'=>$row["explicacion"],
                                                    'aciertos'=>$row["aciertos"]
                                                    );
                                                $exito_en_consulta = TRUE;
                                                $elem = array_map('utf8_encode', $elem);
                                                array_push($res,$elem);
            }
    }
    }
mysqli_close($con);
echo json_encode($res);
?>



