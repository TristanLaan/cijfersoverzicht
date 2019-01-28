<?php
/*Wachtwoord vragen voor bezoeken website */
include "login.php";
include "connect.php";

function verbindDatabase() {
    try {
        global $server, $password, $username, $database, $charset;
        $connectie = new PDO("mysql:host=$server;dbname=$database;charset=$charset", $username, $password);
    } catch (PDOException $ex) {
        echo "<p>Er is een probleem met de database, neem contact op met de beheerder.</p><p>Error informatie:</p><pre>verbindDatabase:\n";
        echo $ex->getMessage() . "</pre>";
        return NULL;
    }

    return $connectie;
}

function getVakken() {
    $database = verbindDatabase();

    if ($database === NULL) {
        exit(1);
    }

    $sql = $database->prepare("SELECT * FROM Vakken");

    if (!$sql->execute()) {
        echo "<p>Er is een probleem met de database, neem contact op met de beheerder.</p><p>Error informatie:</p><pre>getVakken:\n";
        var_dump($sql->errorInfo());
        echo "</pre>";
    }

    $vakken = $sql->fetchAll(PDO::FETCH_ASSOC);
    $database = NULL;
    return $vakken;
}

function getCijfers(array $vakken) {
    $aantalVakken = count($vakken);
    $database = verbindDatabase();

    if ($database === NULL) {
        exit(1);
    }

    for ($i = 0; $i < $aantalVakken; $i++) {
        /* Haal cijfers met deadline eerst op */
        $sql = $database->prepare("SELECT * FROM Cijfers WHERE (Cijfers.vaknr = '" . ($i + 1)
            . "' AND Cijfers.datum IS NOT NULL) ORDER BY vaknr ASC, datum ASC, cijfernr ASC");
        if (!$sql->execute()) {
            echo "<p>Er is een probleem met de database, neem contact op met de beheerder.</p><p>Error informatie:</p><pre>getCijfers (vak: "
                . $vakken[$i]["vaknaam"] . ") met datum:\n";
            var_dump($sql->errorInfo());
            echo "</pre>";
        }

        $cijferszonderdatum = $sql->fetchAll(PDO::FETCH_ASSOC);

        /* Haal cijfers zonder deadline op */
        $sql = $database->prepare("SELECT * FROM Cijfers WHERE (Cijfers.vaknr = '" . ($i + 1)
            . "' AND Cijfers.datum IS NULL) ORDER BY vaknr ASC, datum ASC, cijfernr ASC");
        if (!$sql->execute()) {
            echo "<p>Er is een probleem met de database, neem contact op met de beheerder.</p><p>Error informatie:</p><pre>getCijfers (vak: "
                . $vakken[$i]["vaknaam"] . ") zonder datum:\n";
            var_dump($sql->errorInfo());
            echo "</pre>";
        }

        $cijfersmetdatum = $sql->fetchAll(PDO::FETCH_ASSOC);
        $cijfers[$i] = array_merge($cijferszonderdatum, $cijfersmetdatum);
    }

    return $cijfers;
}

$vakken = getVakken();
$cijfers = getCijfers($vakken);

?>

<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title><?php echo $title; ?></title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
    <style>
        html {
            overflow-x: auto;
        }
    </style>
</head>

<body>
<div style="min-width: 1200px;" class="w3-container">
    <h2>Cijfers</h2>

    <table class="w3-table-all w3-hoverable">
        <thead>
        <tr class="w3-light-grey">
            <th>Vak</th>
            <th style="padding-left: 16px;">Titel</th>
            <th>Datum</th>
            <th>Weging</th>
            <th>Cijfer</th>
        </tr>
        </thead>

        <?php
        /* Alle huidige cijfers tonen */
        $kleur = 0; //kleur bijhouden van vakken kolom tabel

        for ($i = 0; $i < count($vakken); $i++) {
            if ($vakken[$i]["toon"] == 1) {
                /* Berekeningen voor berekenen gemmiddelde cijfers enz. */
                $cijfers[$i]["som"] = 0;
                $cijfers[$i]["weging"] = 0;
                $kleur++;

                /* Door alle cijfers loopen */
                for ($j = 0; $j < count($cijfers[$i]) - 2; $j++) {
                    /* Voor de zekerheid controleren of cijfer voor het juiste vak is */
                    if ($cijfers[$i][$j]["vaknr"] == $vakken[$i]["vaknr"]) {
                        /* Totale weging en totale som cijfers opslaan */
                        if ($cijfers[$i][$j]["cijfer"] != NULL) {
                            if ($cijfers[$i][$j]["weging"] != NULL) {
                                $cijfers[$i]["weging"] += $cijfers[$i][$j]["weging"];
                                $weging = $cijfers[$i][$j]["weging"];
                            } else {
                                $weging = 0;
                            }
                            $cijfers[$i]["som"] += $cijfers[$i][$j]["cijfer"] * $weging;
                        }

                        /* Daadwerkelijk tonen cijfers */
                        ?>

                        <tr>
                            <?php if ($j == 0) { //eerste keer moet vak ook geprint worden
                                echo '<td style="background-color: #';
                                if ($kleur % 2) { //juiste achtergrondkleur selecteren
                                    echo "fff";
                                } else {
                                    echo "f1f1f1";
                                }
                                $lengte = count($cijfers[$i]) - 2;
                                echo '; border-right: 1px solid #ddd; " rowspan="' . $lengte . '">'
                                    . $vakken[$i]["vaknaam"] . '</td>';
                            }
                            ?>
                            <td style="padding-left: 16px;"><?php echo $cijfers[$i][$j]["cijfertitel"]; ?></td>
                            <td><?php if ($cijfers[$i][$j]["datum"] != NULL) {
                                    echo $cijfers[$i][$j]["datum"];
                                } ?></td>
                            <td><?php if ($cijfers[$i][$j]["weging"] != NULL) {
                                    echo ($cijfers[$i][$j]["weging"] / 100) . "%";
                                } ?></td>
                            <td><?php if ($cijfers[$i][$j]["cijfer"] != NULL) {
                                    echo($cijfers[$i][$j]["cijfer"] / 100);
                                } ?></td>
                        </tr>

                        <?php
                    }
                }
            } else { //berekeningen moeten ook gedaan worden voor vakken die niet getoond worden
                $cijfers[$i]["som"] = 0;
                $cijfers[$i]["weging"] = 0;
                for ($j = 0; $j < count($cijfers[$i]) - 2; $j++) {
                    if ($cijfers[$i][$j]["vaknr"] == $vakken[$i]["vaknr"]) {
                        if ($cijfers[$i][$j]["cijfer"] != NULL) {
                            if ($cijfers[$i][$j]["weging"] != NULL) {
                                $cijfers[$i]["weging"] += $cijfers[$i][$j]["weging"];
                                $weging = $cijfers[$i][$j]["weging"];
                            } else {
                                $weging = 0;
                            }

                            $cijfers[$i]["som"] += $cijfers[$i][$j]["cijfer"] * $weging;
                        }
                    }
                }
            }
        }
        ?>

    </table>

    <h2>Vakken</h2>

    <table class="w3-table-all w3-hoverable">
        <thead>
        <tr class="w3-light-grey">
            <th>Vak</th>
            <th>Jaar</th>
            <th>Periode</th>
            <th>Gemiddelde cijfer</th>
            <th>(Voorlopig) eindcijfer</th>
            <th>Studiepunten</th>
            <th>Gehaald</th>
        </tr>
        </thead>

        <?php
        /* Vakken tonen */
        $studiepunten = 0;
        for ($i = 0; $i < count($vakken); $i++) {
            if ($vakken[$i]["gehaald"]) {
                $studiepunten += $vakken[$i]["studiepunten"];
            }
            ?>
            <tr>
                <td><?php echo $vakken[$i]["vaknaam"]; ?></td>
                <td><?php echo $vakken[$i]["jaar"]; ?></td>
                <td><?php if ($vakken[$i]["periode"] != "0") {
                    echo $vakken[$i]["periode"];
                    } ?></td>
                <td><?php if ($cijfers[$i]["weging"] != 0) {
                        echo round($cijfers[$i]["som"] / $cijfers[$i]["weging"]) / 100;
                    } ?></td>
                <td><?php
                    if ($vakken[$i]["eindcijfer"] != NULL) {
                    ?>
                    <abbr style="text-decoration: none;" title="definitief">
                        <?php
                        echo $vakken[$i]["eindcijfer"] / 100;
                        } elseif ($cijfers[$i]["weging"] != 0) {
                        ?>
                        <abbr style="text-decoration: none;" title="voorlopig">
                            <?php
                            echo round($cijfers[$i]["som"] / 10000) / 100;
                            }
                            ?></abbr></td>
                <td><?php echo $vakken[$i]["studiepunten"]; ?></td>
                <td><?php echo $vakken[$i]["gehaald"] ? "ja" : "nee"; ?></td>
            </tr>
            <?php
        }
        if ($studiepunten >= 42) {
            $bsa = "ja";
        } else {
            $bsa = "nee";
        }
        ?>
    </table>

    <p><b>Totaal aantal studiepunten:</b> <?php echo $studiepunten; ?></p>
    <p><b>BSA gehaald:</b> <?php echo $bsa; ?></p>


    <h2>Oude cijfers</h2>

    <table class="w3-table-all w3-hoverable">
        <thead>
        <tr class="w3-light-grey">
            <th>Vak</th>
            <th style="padding-left: 16px;">Titel</th>
            <th>Datum</th>
            <th>Weging</th>
            <th>Cijfer</th>
        </tr>
        </thead>
        <?php
        /* Cijfers met niet tonen tonen */
        $kleur = 0;
        for ($i = 0; $i < count($vakken); $i++) {
            if ($vakken[$i]["toon"] == 0) {
                $kleur++;
                for ($j = 0; $j < count($cijfers[$i]) - 2; $j++) {
                    if ($cijfers[$i][$j]["vaknr"] == $vakken[$i]["vaknr"]) {
                        ?>
                        <tr>
                            <?php if ($j == 0) {
                                echo '<td style="background-color: #';
                                if ($kleur % 2) {
                                    echo "fff";
                                } else {
                                    echo "f1f1f1";
                                }
                                $lengte = count($cijfers[$i]) - 2;
                                echo '; border-right: 1px solid #ddd;" rowspan="' . $lengte . '">'
                                    . $vakken[$i]["vaknaam"] . '</td>';
                            }
                            ?>
                            <td style="padding-left: 16px;"><?php echo $cijfers[$i][$j]["cijfertitel"]; ?></td>
                            <td><?php if ($cijfers[$i][$j]["datum"] != NULL) {
                                    echo $cijfers[$i][$j]["datum"];
                                } ?></td>
                            <td><?php if ($cijfers[$i][$j]["weging"] != NULL) {
                                    echo ($cijfers[$i][$j]["weging"] / 100) . "%";
                                } ?></td>
                            <td><?php if ($cijfers[$i][$j]["cijfer"] != NULL) {
                                    echo($cijfers[$i][$j]["cijfer"] / 100);
                                } ?></td>
                        </tr>
                        <?php
                    }
                }
            }
        }
        ?>
    </table>

</div>
<br>
<?php /*?>
    <!--
-----------DEBUG-------------
    <?php
        echo "\n";
        print_r($bsa);
        echo "\n";
        print_r($studiepunten);
        echo "\n";
        print_r($vakken);
        print_r($cijfers);
    ?>
    -->
    */ ?>
</body>
</html>
