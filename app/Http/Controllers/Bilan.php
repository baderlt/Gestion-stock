<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Carbon\Carbon;
use DB;

class Bilan extends Controller
{
    public function bilan(Request $request){
        // Get the requested year, default to the current year
        $year = $request->query('year', date('Y'));

        // Fetch stock balance
        $stock = DB::table('articles_en_stock')
            ->join('articles', 'articles_en_stock.id_article', '=', 'articles.id')
            ->select(DB::raw('SUM(articles_en_stock.quantite_courant_article) as sum2, articles.nom_article, articles.id'))
            ->whereYear('articles_en_stock.created_at', '<=', $year) // Include data up to the specified year
            ->groupBy('articles.nom_article', 'articles.id')
            ->orderBy('articles.id')
            ->distinct('articles.nom_article')
            ->get();

        // Function to get employee data
        function employee($nom_articles, $year) {
            return DB::table('historiques')
                ->join('articles', 'historiques.id_article', '=', 'articles.id')
                ->join('employees', 'historiques.id_employee', '=', 'employees.id_employee')
                ->select(DB::raw('SUM(quantite_prise) as sum_prise, employees.nom_employee'))
                ->whereYear('historiques.date_retrait', '=', $year)
                ->where('articles.nom_article', '=', $nom_articles)
                ->groupBy('employees.nom_employee')
                ->distinct('employees.nom_employee')
                ->get(); 
        };

        // Function to calculate quantity for a specific article
        function calcule($nom, $year) {
            $historique = DB::table('historiques')
                ->join('articles', 'historiques.id_article', '=', 'articles.id')
                ->join('employees', 'historiques.id_employee', '=', 'employees.id_employee')
                ->select(DB::raw('SUM(quantite_prise) as sum, articles.nom_article'))
                ->whereYear('historiques.date_retrait', '=', $year)
                ->groupBy('articles.nom_article')
                ->orderBy('articles.id')
                ->distinct('articles.nom_article')
                ->get();

            foreach($historique as $histori) {
                if($histori->nom_article == $nom) {
                    return $histori->sum;
                }
            }
            return 0;
        }

        // Prepare the result array
        $aray = [];
        foreach($stock as $stockItem) {
            $arr = [
                'sum' => $stockItem->sum2 + calcule($stockItem->nom_article, $year),
                'quantite_courant' => $stockItem->sum2,
                'nom' => $stockItem->nom_article,
                'id' => $stockItem->id,
                'employee' => employee($stockItem->nom_article, $year)
            ];
            array_push($aray, $arr);
        }

        return $aray;
    }

    public function produit_Epuise(Request $request) {
        return DB::table('articles_en_stock')
            ->join('articles', 'articles_en_stock.id_article', '=', 'articles.id')
            ->select(DB::raw('SUM(quantite_courant_article) as qnt, articles.nom_article'))
            ->havingRaw('SUM(quantite_courant_article) <= ?', [$request->qnt])
            ->groupBy('articles.nom_article')
            ->get();
    }

    public function Years_Bilan(){
            // Assuming you have a date field in your articles_en_stock table
            $years = DB::table('articles_en_stock')
            ->select(DB::raw('DISTINCT YEAR(created_at) as year')) // Adjust 'created_at' to your actual date column
            ->orderBy('year', 'desc')
            ->pluck('year'); // This will give you a collection of years

        return $years;

    }
}
