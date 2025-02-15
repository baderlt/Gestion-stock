import {  faPrint, faRetweet } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { PersonRemove } from "@mui/icons-material";
import { FormControl, InputLabel, MenuItem, Select,Button,ButtonGroup, Typography, Autocomplete, Drawer, Box, Tabs, Fab, BottomNavigation, BottomNavigationAction, Paper, Snackbar, Alert } from "@mui/material";
import { useEffect } from "react";
import excel from '../../../exceller.png';
// import { Select } from "flowbite-react";
import { useRef, useState } from "react";
import { DownloadTableExcel } from "react-export-table-to-excel";
import ReactToPrint, { useReactToPrint } from "react-to-print";
import axios from "axios";
import { motion } from "framer-motion";
import { confirmAlert } from "react-confirm-alert";
import './print.css';


export default function MainDashboardStockHistorique(props){

    const [historique,sethistorique]=useState();
    const [message,setmessage]=useState();
    const [table_isload,settable_isload]=useState(false);
    const [error,seterror]=useState();

    const [date_,setdate]=useState('Tout');
    const [ValueOfdate,setValueOfdate]=useState('générale ');
    const [tri_par_,settri_par]=useState('historiques.date_retrait');
    const [employee,setemployee]=useState('all');
    const [listEmployees,SetListeEmployees]=useState();

   
// SetListeEmployees([{nom_employee:'bader'}])

useEffect( ()=>{
  axios.get('/get_employe')
 .then((res)=>{SetListeEmployees(res.data)})
 .catch(err=>console.log('Server Error'));
  Historique_table('Tout','historiques.date_retrait','all');
},[])

    function Historique_table(date=date_,tri_par=tri_par_,employee_=employee){
    
   
    let body=JSON.stringify({
        tri_par:tri_par,
        date:date,
        employee:employee_
    })
    // alert(body);
    try {
        const newLocal ="/Get_historique/"+body;
        axios.get(newLocal).then((res)=>{sethistorique(res.data),settable_isload(true)})
        .catch(
          function(error){
            const timeoutId2= setTimeout(() => {
                seterror('Error server Try agen')
            }, 1);
            const clear = setTimeout(() => {
              return () => clearTimeout(timeoutId2),seterror(false);
              
            }, 2000);
            
          }
           )
        
             }
             catch (err) {
              seterror('Error server Try agen')
      }
    }    

    const HandelDateValue=(e)=>{
      setdate(e.target.value)
      switch(e.target.value){
      case 'jour':setValueOfdate(new Date().toLocaleDateString());
      break
      case 'mois':setValueOfdate(`le mois ${new Date().getMonth()}-${new Date().getFullYear()}`);
      break
      case 'annee' :setValueOfdate(`année ${new Date().getFullYear()}`)
      break 
      case 'Tout':setValueOfdate('générale');
      break
      default :setValueOfdate('générale');
      }
      // setValueOfdate(option);
    }
///////////////////////////////////////
   const componentRef = useRef();
        const handlePrint = useReactToPrint({ 
    
          content: () => componentRef.current,
          onAfterPrint:()=>{},
          documentTitle:`Historiques-retraites-${ValueOfdate}`
        });
        const handlePrintClick = () => {
          // Toggle visibility of additional information before printing
          const printHeader = document.querySelector('.info-print');
          if (printHeader) {
            printHeader.classList.toggle('visible');
          }
      
          // Trigger the print
          handlePrint();
        };


////////////////////////////////////////////   
const table_Exel=useRef();


function isToday(dateString) {
  const today = new Date();
  const inputDate = new Date(dateString);

  // Set hours, minutes, seconds, and milliseconds to 0 for both dates
  today.setHours(0, 0, 0, 0);
  inputDate.setHours(0, 0, 0, 0);

  return today.getTime() === inputDate.getTime();
}

const Annuler_retrait=async(id)=>{
  let body=JSON.stringify({
    id_historique:id,
})

try{
  await axios.get('/annuler_retrait/'+body)
  .then(()=>{setmessage('Operation Validé'),Historique_table(date_,tri_par_,employee)})
  .catch((e)=> seterror('Error server Try agen'));
}catch(e){
  seterror('Error server Try agen')
}
}

const Confirmation = (hitrorique_id,employee) => {
  confirmAlert({
    title:"Confirmation de l'annulation",
    message: "Vous voulez vraiment annuler le retrait de l'employé  "+employee+" ?",
    buttons: [
      {
        label: 'Confirmer',
        onClick: () => Annuler_retrait(hitrorique_id)
      },
      {
        label: 'Annuler',
        onClick: () => {}
    }
      
    ]
  })
}
const vertical="top";
const horizontal="right"
const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setmessage(false);
    seterror(false)
  
  }
    return(
        <>
<motion.div animate={{marginTop:'20px'}}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs   aria-label="basic tabs example">
        
                    <Fab variant="extended" color="primary" size="small">
                        <PersonRemove sx={{ mr: 1 }} />
                        Historique des retraits
                    </Fab>
            </Tabs>
        </Box> 

        </motion.div>
        <Snackbar anchorOrigin={{vertical,horizontal}} open={message} autoHideDuration={5000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="success" sx={{ width: '120%' }}
        variant="filled">
  {message}
        </Alert>

      </Snackbar>
      <Snackbar anchorOrigin={{vertical,horizontal}} open={error} autoHideDuration={5000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="error" sx={{ width: '120%' }}
        variant="filled">
       {error}
        </Alert>

      </Snackbar>
<br></br>
<motion.div animate={{x:6}}>
<div class="flex flex-row justify-between md:flex-col">
  
<div className=""><FormControl variant="standard" sx={{ ml: 1, minWidth: 160 }}>
                <InputLabel id="demo-simple-select-standard-label">Période</InputLabel>
                <Select
                labelId="demo-simple-select-standard-label"
                id="demo-simple-select-standard"
               
                label="Période" onChange={(e)=>{HandelDateValue(e);Historique_table(e.target.value,tri_par_,employee)}}>
                  <MenuItem  value='jour' > Aujourd'hui</MenuItem>
                <MenuItem  value='mois'>Ce Mois</MenuItem>
                  <MenuItem   value='annee' >Cette annéé</MenuItem>
                 <MenuItem  value='Tout'>générale</MenuItem>
               
                </Select>
               
        </FormControl>
        { listEmployees && listEmployees.length  > 1 ?
        <FormControl variant="standard" sx={{ ml: 1, minWidth: 160 }} >
                <InputLabel id="demo-simple-select-standard-label">Employee</InputLabel>
                <Select
                labelId="demo-simple-select-standard-label"
                id="demo-simple-select-standard"
               
                label="Employee" onChange={(e)=>{setemployee(e.target.value);Historique_table(date_,tri_par_,e.target.value)}}>
                  <MenuItem  value='all' > Tous</MenuItem> 
            
                
                  { listEmployees.map((i)=>{ return <MenuItem  value={i?.nom_employee} >{i?.nom_employee}</MenuItem>})}

               
</Select>
        </FormControl>:""}

        <FormControl variant="standard" sx={{ ml: 1, minWidth: 160 }}>
                <InputLabel id="demo-simple-select-standard-label">Trier par</InputLabel>
                <Select
                labelId="demo-simple-select-standard-label"
                id="demo-simple-select-standard"
               
                label="Trie" onChange={(e)=>{settri_par(e.target.value),Historique_table(date_,e.target.value,employee)}}>
                 <MenuItem value='historiques.date_retrait'>Date</MenuItem>
                 <MenuItem value='employees.nom_employee' > Nom employee</MenuItem>
                <MenuItem value='articles.nom_article'>Nom article</MenuItem>
                </Select>
        </FormControl>
        </div>
        <div className="flex flex-row md:flex-wrap ">
   
<DownloadTableExcel
                        filename={ `Historiques-retraites-${ValueOfdate}`}
                        sheet={`Historiques des retraites-${ValueOfdate}`}
                        currentTableRef={table_Exel.current}>
<button className="py-2  group pl-12 w-48 "><Button size="large"  variant="outlined" color="success"   >
                    
 <img src={excel} alt="excel" width={22} height={22}  className=" "/>&ensp;     Excel</Button>
 </button>

                </DownloadTableExcel>
               
              
<button  className=" py-2 w-48" onClick={handlePrintClick}>

 <Button size="large"  variant="outlined" color="success"  startIcon={ <FontAwesomeIcon icon={faPrint}/>}  >  Impression</Button>
</button>

</div>
        </div>
        </motion.div>
<div ref={componentRef}>
 <div className="info-print"> <div className="text-xl"><h3><strong>Date</strong> :{new Date().toLocaleDateString()} <br />
           <strong> Historiques des retraites:</strong> {ValueOfdate}<br></br>
            {employee==='all'?'': `${'Employee:'}${employee}`}</h3><br /></div>;</div>
       
    <table  ref={table_Exel}class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
      <div className="text-xl " style={{display:'none'}}> <h2>Historiques des retraites: {ValueOfdate}</h2><br></br>
      {console.log(employee)}
      </div>
        <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
                <th scope="col" class="px-6 py-3">
                 Nom Employee
                </th>
                <th scope="col" class="px-6 py-3">
                Nom d'article
                </th>
                <th scope="col" class="px-6 py-3">
                Quantite Prise
                </th>
                <th scope="col" class="px-6 py-3">
                 Date
                </th>
                <th scope="col" class="px-6 py-3">
                Annuler la retrait
                </th>
            </tr>
        </thead>
  
        {table_isload &&  historique.length >= 1? historique.map((item)=>{return <tr class="bg-white mt-24 border-b dark:bg-gray-900 dark:border-gray-700">

                 <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-black">
                 {item.nom_employee}
              
                 </th>
                 <td class="px-6 py-4">
                 {item.nom_article}
                 </td>
                 <td class="px-6 py-4">
                 <b className="text-black">{item.quantite_prise}</b>
                 {/* <input type="text" value={item.unite==null ? 'Unité': item.unite} />{item.unite==null ? 'Unité': item.unite}  */}
                 </td>
                 <td class="px-6 py-4">
                   
                {/* <input type="text"  value={qnt} onChange={(e)=>{setqnt(e.target.value)}}/>  */}
                {item.date_retrait}
                 </td>
                 <td class="px-6 py-4 text-center">
                   
                   {/* <input type="text"  value={qnt} onChange={(e)=>{setqnt(e.target.value)}}/>  */}
                   <button  disabled={isToday(item.date_retrait)?false:true} onClick={()=>{Confirmation(item.id_historique,item.nom_employee)}} > <FontAwesomeIcon icon={faRetweet} color={isToday(item.date_retrait)?'red':'gray '} size="xl" /></button>
                
                    </td>
             </tr>
         
         }) :<tr> <th colSpan={5}  className="text-black text-center h-10 text-sm bg-red-100" ><h3>Aucun historique de retrait  trouvé </h3> </th></tr>}
     
        </table></div>


    </>
    )
} 

