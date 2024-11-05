import { BatteryAlert, CalculateSharp, MonetizationOnSharp, Money, ProductionQuantityLimits, ProductionQuantityLimitsOutlined, QueryStats, Summarize, TimeToLeave, Water } from "@mui/icons-material";
import { Button, Tab, Tabs, Box, Fab, InputLabel, Autocomplete, TextField, FormControl, Grid, Select, MenuItem } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPrint } from '@fortawesome/free-solid-svg-icons';
import React, { useRef, useState, useEffect } from "react";
import StatistiquesProduitEpuise from "./StatistiquesProduitEpuise";
import excel from '../../../exceller.png';
import { DownloadTableExcel } from "react-export-table-to-excel";
import { useReactToPrint } from "react-to-print";
import { motion } from "framer-motion";
import axios from 'axios'; // Make sure to import axios

export default function MainDashboardStockStatistiques(props) {
    const date_of_today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const [data, setdata] = useState();
    const [data_is_load, setdata_is_load] = useState(false);
    const [fonctionnaire, setfonctionnaire] = useState();
    const [functis_load, setfunctis_load] = useState(false);
    const [consomation, setconsomation] = useState(true);
    const [produitEpuise, setproduitEpuise] = useState(false);
    const [year, setYear] = useState(new Date().getFullYear()); // New state for year
    const [Years,setYears]=useState([]);

    useEffect(() => {
        axios.get(`/bilan?year=${year}`) // Fetch data for the selected year
            .then((res) => {
                setdata([res.data]);
                setdata_is_load(true);
            })
            .catch(err => console.log(err));
        
        axios.get('/listeEmployees')
            .then((res) => {
                setfonctionnaire(res.data);
                setfunctis_load(true);
            });
        axios.get('/years_Bilan')
        .then((res)=>{
          setYears(res.data)
        }).catch((err)=>console.log(err));    
    }, [year]); // Re-fetch data when the year changes

    function sum_prise(nom, prise) {
        let len = prise.length;
        let qnt = 0;
        for (let i = 0; i < len; i++) {
            if (prise[i].nom_employee == nom) {
                qnt = prise[i].sum_prise;
            }
        }
        return <td className="px-6 py-4 border text-black border-slate-900 bg-red-50 whitespace-nowrap ">{qnt}</td>;
    }

    const componentRef = useRef();
    const handlePrint = useReactToPrint({ content: () => componentRef.current });

    return (
        <div>
            <motion.button animate={{ marginTop: '10px', marginLeft: "10px" }}>
                <button onClick={() => { setconsomation(true), setproduitEpuise(false) }}>
                    <Fab variant="extended" color="secondary">
                        <QueryStats sx={{ mr: 1 }} />
                        Consomation
                    </Fab>
                </button>
            </motion.button>
            <motion.button animate={{ marginLeft: '20px', marginTop: '10px' }}>
                <button onClick={() => { setconsomation(false), setproduitEpuise(true) }}>
                    <Fab variant="extended" color="error">
                        <QueryStats sx={{ mr: 1 }} />
                        Les produit Epuisé
                    </Fab>
                </button>
            </motion.button>
            <br></br>

            {/* Year Selection */}
            <motion.div animate={{ marginTop: '20px', paddingLeft: '10px' }}>
            <FormControl variant="standard" sx={{ ml: 1,mr:4, minWidth: 160 }}>
                <InputLabel id="demo-simple-select-standard-label">Year</InputLabel>
                <Select
                labelId="demo-simple-select-standard-label"
                id="demo-simple-select-standard"
               
                label="Years" onChange={(e)=>{setYear(e.target.value)}}>
                  {Years.map((item,index)=>{
                    return <MenuItem  value={item} > {item}</MenuItem>
                  })}
               
               
                </Select>
               
        </FormControl>
                <DownloadTableExcel
                    filename={consomation ? `Bilan__generale_${year}` : 'Produits_épuisé'}
                    sheet={consomation ? `Bilan__generale_${year}` : 'Produits_épuisé'}
                    currentTableRef={componentRef.current}
                >
                    <button className=" group pl-2 ">
                        <Button size="large" variant="outlined" color="success">
                            <img src={excel} alt="excel" width={22} height={22} className=" " />&ensp; Excel
                        </Button>
                    </button>
                </DownloadTableExcel>

                <button className="pl-4 " onClick={handlePrint}>
                    <Button size="large" variant="outlined" color="success" startIcon={<FontAwesomeIcon icon={faPrint} />}> Impression</Button>
                </button>
            </motion.div>

            <div className="">
                <br></br><br />
                <div className="" ref={componentRef}>
                    <div className="text-s" style={{ display: 'none' }}>
                        <h3>{consomation ? <p>Bilan générale: {year}<br></br> Date d'impression: {new Date().toLocaleDateString()}</p>
                            : <p>les Produits épuisé ou Presque épuisé <br /> Date d'impression: {new Date().toLocaleDateString()}</p>}</h3>
                    </div>
                    {consomation ?
                        data_is_load ?
                            <motion.div animate={{ width: '100%' }}>
                                <table className="text-xm w-full text-black uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 border border-slate-600">ID</th>
                                            <th scope="col" className="px-6 py-3 border border-slate-600">Nom d'article</th>
                                            <th scope="col" className="px-6 py-3 border border-slate-600">Quantite initial</th>
                                            {functis_load ? fonctionnaire.map((nom) =>
                                                <th key={nom.id_employee} scope="col" className="px-6 py-3 border text-black border-slate-600 bg-red-100">{nom.nom_employee}</th>
                                            ) : ''}
                                            <th scope="col" className="px-6 py-3 border border-slate-600">Totale Sortie</th>
                                            <th scope="col" className="px-6 py-3 border border-slate-600">Stock Final</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data ? data[0].map((item) => {
                                            return (
                                                <tr key={item.id} className="bg-white border-b dark:bg-gray-900 dark:border-gray-700">
                                                    <th scope="row" className="px-6 py-4 font-medium text-black-900 whitespace-nowrap dark:text-black border border-slate-900">{item.id}</th>
                                                    <th scope="row" className="px-6 py-4 font-medium text-black-900 whitespace-nowrap dark:text-black border border-slate-900">{item.nom}</th>
                                                    <td className="px-6 py-4 border border-slate-900 whitespace-nowrap">{item.sum}</td>
                                                    {functis_load ? fonctionnaire.map((item2) => sum_prise(item2.nom_employee, item.employee)) : ''}
                                                    <td className="px-6 py-4 font-medium text-black-900 whitespace-nowrap dark:text-black border border-slate-900">{item.sum - item.quantite_courant}</td>
                                                    <td className="px-6 py-4 font-medium text-black-900 whitespace-nowrap dark:text-black border border-slate-900">{item.quantite_courant}</td>
                                                </tr>
                                            );
                                        }) : ''}
                                    </tbody>
                                </table>
                            </motion.div>
                        : ''
                        : ''
                    }
                    {produitEpuise ? <StatistiquesProduitEpuise /> : ''}
                </div>
            </div>
        </div>
    )
}
