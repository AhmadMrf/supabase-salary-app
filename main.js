import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://evcestdvcdqmklxwirmp.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2Y2VzdGR2Y2RxbWtseHdpcm1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NTMzMDk2ODUsImV4cCI6MTk2ODg4NTY4NX0.TsUgJIRuIavxbvz0Ez-sdJ9uuaQHcIGuWrD5lUjHnrw";
const database = createClient(supabaseUrl, supabaseKey);

const loginLabel = document.querySelector("#login-label");
const loginContent = document.querySelector("#login-content");
const addPatientSection = document.querySelector("#add-patient-form");
const tbody = document.querySelector("table > tbody");
let errorBox = document.querySelector("#error-box");
const patientBill = document.querySelector(".patient-account");
const wrapper = document.querySelector(".limiter");
let signinForm; //declare in setLoginContent func
let signupForm; //declare in setLoginContent func
let signoutBtn; //declare in setLoginContent func
let addPatientForm;

let isLogin = database.auth.user(); // return null or user data

console.log("islog?", isLogin);

//toggle between sign in and sign up form
loginContent.addEventListener("click", (e) => {
  if (e.target.classList.contains("hidden")) {
    let forms = loginContent.children;
    forms[0].classList.toggle("hidden");
    forms[1].classList.toggle("hidden");
  }
});

// setup app in first run
setupApp(isLogin);

// if sign in done , return user info
// if error call errorManage func
async function signInAccount() {
  console.log("signin");
  let email;
  let password;

  email = signinForm.elements.email.value;
  password = signinForm.elements.password.value;

  const { user, error } = await database.auth.signIn({
    email,
    password,
  });
  // console.log(typeof error);
  if (error) {
    errorManage(error);
  }
  return user;
}

//if signup return user info
//if error call errorManage func
async function signUpAccount() {
  console.log("signup");
  let email;
  let password;
  let fullName;
  let job;
  email = signupForm.elements.email.value;
  password = signupForm.elements.password.value;
  fullName = signupForm.elements.fullName.value;
  job = signupForm.elements.job.value;

  const { user, error } = await database.auth.signUp(
    {
      email,
      password,
    },
    {
      data: {
        fullName,
        job,
      },
    }
  );
  if (error) {
    errorManage(error);
  }
  return user;
}

// sign out user and return null
async function signOutAccount() {
  console.log("signout");
  let activeSession = database.auth.session();
  return await database.auth.signOut(activeSession.access_token);
}

//manage errors
function errorManage(errorMessage) {
  console.log("error manage");
  errorBox.style.display = "block";
  errorBox.innerHTML = errorMessage.message;
  setTimeout(() => {
    errorBox.innerHTML = "";
    errorBox.style.display = "none";
  }, 5000);
  console.log(errorMessage, "مدیریت خطا");
}

//give user id
//if success return data form database
//if error return null and call errorManage func
async function getPatientsData(id) {
  console.log("get");
  let { data, error } = await database.from("patients");
  if (error) {
    errorManage(error);
    return null;
  }
  return data;
}

//get a 'string' as argument
// change between signin , signup and signout and call setupApp again or call errorManage func
async function changeSignState(stat) {
  console.log("click btn");

  let userData;

  switch (stat) {
    case "signin":
      // sign in btn active
      userData = await signInAccount();
      if (userData) {
        setupApp(userData);
      } else {
        console.log(userData, " خطا");
      }
      break;
    case "signup":
      // sign up btn active
      userData = await signUpAccount();
      if (userData) {
        setupApp(userData);
      } else {
        console.log(userData, " خطا");
      }
      break;
    default:
      // sign out btn active
      let { error } = await signOutAccount();
      if (error) {
        console.log("has error", error);
      } else {
        console.log("no error", error);
        setupApp(null);
      }
  }
}

//get user data (loginState) or null as argument
function setLabelLoginTab(loginState) {
  loginLabel.textContent = loginState
    ? `درمانگر : ${loginState.user_metadata.fullName}`
    : "ورود - ثبت نام";
}

//get user data (loginState) or null and patients (patients array) as argument
//and 1- set inner content 2- declare signoutBtn and signinForm 3- add event listener to buttons
function setLoginContent(loginState, patients) {
  if (loginState) {
    loginContent.innerHTML = `
      <div class="panel-account">
        <div class="panel-info">
          <span>${loginState.user_metadata.fullName}</span>
          <span>${loginState.user_metadata.job}</span>
          <span>تعداد بیماران : <span id="patient-number" >${patients ? patients.length : "-"
      }</span></span>
        </div>
        <button name="signoutBtn" type="button" href="#">خروج</button>
      </div>
  `;
    signoutBtn = loginContent.querySelector("button");
    signinForm = null;
    signupForm = null;

    signoutBtn.addEventListener("click", () => changeSignState("signout"));

    // return {signinForm,signupForm,signoutBtn}
  } else {
    loginContent.innerHTML = `
    <form data-type="ورود" action="#">
      <div class="info">
        <input  required type="email" name="email" placeholder="ایمیل" />
        <input  required type="password" name="password" placeholder="رمز ورود" />
      </div>
      <button name="signinBtn" type="button" href="#">ورود</button>
      <a href="#">فراموشی رمز عبور </a>
    </form>

    <form class=" hidden"  data-type="ثبت نام" action="#">
      <div class="info">
        <input  required type="email" name="email" placeholder="ایمیل" />
        <input  required type="password" name="password" placeholder="رمز ورود" />
        <input  required type="text" name="fullName" placeholder="نام و نام خانوادگی" />
        <input  required type="text" name="job" placeholder="سمت و شغل" />
      </div>
      <button name="signupBtn" type="button" href="#"> ثبت نام</button>
    </form>
`;
    signinForm = loginContent.querySelectorAll("form")[0];
    signupForm = loginContent.querySelectorAll("form")[1];

    signinForm.elements.signinBtn.addEventListener("click", () =>
      changeSignState("signin")
    );
    signupForm.elements.signupBtn.addEventListener("click", () =>
      changeSignState("signup")
    );

    signoutBtn = null;

    //  return {signinForm,signupForm,signoutBtn}
  }
}

//get user data (loginState) or null and patients (patients array) as argument
// and fill rows based on patients info from database
async function setTableContent(loginState, patients) {
  if (loginState) {
    if (patients) {
      let bills = await getPatientBillData();

      function totalCost(id) {
        let patientBill = bills.filter((bill) => bill.patient_id == id);
        let patientCost = patientBill.reduce((totalBill, bill) => {
          return {
            cost: bill.visit + bill.equipment + (totalBill.cost ?? 0),
            incomes: bill.income + (totalBill.incomes ?? 0),
          };
        }, {});
        return { ...patientCost, billsLength: patientBill.length };
      }

      let cost, incomes, billsLength;

      tbody.innerHTML = patients
        .map((patient, i) => {
          ({ cost, incomes, billsLength } = totalCost(patient.id));
          return (patient = `<tr>
          <td class="column1">${+i + 1}</td>
          <td class="column2">${patient.fullName}</td>
          <td class="column3">${patient.telNum}</td>
          <td class="column4">${cost ?? 0}</td>
          <td class="column5">${incomes ?? 0}</td>
          <td class="column6">
            <button class="delete-patient" data-patientid="${patient.id}" >حذف</button>
            <button class="edit-patient" data-patientid="${patient.id}" >اصلاح</button>
            <button class="edit-bill" data-patientid="${patient.id
            }" > صورت حساب <span>(${billsLength})<span> </button></td>
          </tr>`);
        })
        .join("");

      // let addCost = document.querySelector("#add-cost");

      let editPatients = tbody.querySelectorAll(".edit-patient");
      editPatients.forEach((editPatient) => {
        editPatient.addEventListener("click", (e) =>
          openPatientBill(e, patients, bills)
        );
      });

      let deletePatients = tbody.querySelectorAll(".delete-patient");
      deletePatients.forEach((deletePatient) => {
        deletePatient.addEventListener("click", (e) =>
        deletePatientFromDb(e.target.dataset.patientid)
        // console.log(e.target.dataset.patientid)
        );
      });
      let editBtns = tbody.querySelectorAll(".edit-bill");
      editBtns.forEach((editBtn) => {
        editBtn.addEventListener("click", (e) =>
          openPatientBill(e, patients, bills)
        );
      });
      // addCost.addEventListener("click", () => {
      //   addBill();
      // });

      if (!patients.length) {
        tbody.innerHTML = `<tr>
       <td class="fake-td" colspan="4">شما هنوز بیماری ثبت نکرده اید . </td>
       <td class="fake-td" colspan="2"><label for="add-patient">افزودن بیمار جدید </label></td>
       </tr>`;
      }
    } else {
      tbody.innerHTML = `<tr>
      <td class="fake-td" colspan="4">اختلال در دریافت اطلاعات بیماران </td>
      <td class="fake-td" colspan="2"><button id="refreshBtn" >مجدد تلاش کنید</button></td>
      </tr>`;
      document
        .querySelector("#refreshBtn")
        .addEventListener("click", () => setupApp(isLogin));
    }
  } else {
    tbody.innerHTML =
      '<tr><td class="fake-td" colspan="6">برای مشاهده اطلاعات وارد حساب کاربری خود شوید</td></tr>';
  }
}


const dialogBillTbody = patientBill.querySelector("tbody");
//with click on any patient is opening a dialog box with that patient info
//so filter and show bills that are relative to that patient
// and add event listener to close btn
async function openPatientBill(e, patients, patientBillData) {
  wrapper.classList.add("shadow");
  patientBill.classList.remove("hidden");
  let selectedPatient = patients.find(
    (patient) => patient.id == e.target.dataset.patientid
  );

  const patientFullname = patientBill.querySelector("#patient-fullname");
  const patientCodenum = patientBill.querySelector("#patient-codenum");
  const patientTelnum = patientBill.querySelector("#patient-telnum");
  const patientAdderes = patientBill.querySelector("#patient-adderes");
  const addBillForm = patientBill.querySelector("form");
  const closeDialogBillBtn = patientBill.querySelector("#close-bill-btn")
  const addNewBillBtn = patientBill.querySelector("#add-bill")
  // const addBillFormBtn = addBillForm.querySelector("button");


  patientFullname.innerHTML = selectedPatient.fullName;
  patientCodenum.innerHTML = selectedPatient.codeNum;
  patientTelnum.innerHTML = selectedPatient.telNum;
  patientAdderes.innerHTML = selectedPatient.adderes;

   renderpatientBill(selectedPatient.id, patientBillData);
  
  function closeDialogBill(){
    wrapper.classList.remove("shadow");
    patientBill.classList.add("hidden");
    dialogBillTbody.innerHTML = "";
    setTableContent(isLogin, patients);
    addNewBillBtn.removeEventListener('click',addNewBill)
   closeDialogBillBtn.removeEventListener('click',closeDialogBill)
  }

  function addNewBill(){
    let newBillData = {
      created_at: addBillForm.elements.date.value,
      patient_id: selectedPatient.id,
      nurse_id: database.auth.user().id,
      visit: addBillForm.elements.visit.value,
      income: addBillForm.elements.income.value,
      desc: addBillForm.elements.desc.value,
      equipment: addBillForm.elements.equipment.value,
    };
    addBillToDb(newBillData);
  
  }
  

  closeDialogBillBtn.addEventListener("click", closeDialogBill);
  addNewBillBtn.addEventListener("click", addNewBill);
  
}

function renderpatientBill(patientid, bills) {
  console.log('renderbill');
  let dialogBillContent = bills
    .filter((bill) => {
      return bill.patient_id == patientid;
    })
    .map((bill, i) => {

      return `
    <tr>
        <td class="column1">${+i + 1}</td>
        <td class="column2">${new Date(bill.created_at).toLocaleString(
        "fa"
      )}</td>
        <td class="column3">${bill.visit}</td>
        <td class="column4">${bill.equipment}</td>
        <td class="column5">${bill.income}</td>
        <td class="column6">
          <button class="edit-bill" data-bill="${bill.id}" >اصلاح</button>
          <button class="delete-bill" data-bill="${bill.id}" >حذف</button>
        </td>
    </tr>
    `;
    })
    .join("");
    
    dialogBillTbody.innerHTML = dialogBillContent

    let editBills = dialogBillTbody.querySelectorAll(".edit-bill");
      editBills.forEach((editBill) => {
        editBill.addEventListener("click", (e) =>
          openPatientBill(e, patients, bills)
        );
      });
      let removeBills = dialogBillTbody.querySelectorAll(".delete-bill");
      removeBills.forEach((removeBill) => {
        removeBill.addEventListener("click", (e) =>
        removeBillFromDb(e.target.dataset.bill, patientid)
        );
      });
}

async function removeBillFromDb(billid, patientid){
  console.log("delete bill");

  let { billData, billError } = await database
  .from('bills')
  .delete()
  .match({ id: billid })

  if(billError){
    errorManage(billError);
  } else {
    let newBills = await getPatientBillData(patientid);
    renderpatientBill(patientid, newBills);
  }
}

async function addBillToDb(billData) {
  console.log("add bill");
  let { patient_id: patientid } = billData
  let { error } = await database.from("bills").insert([billData], {
    returning: "minimal",
  });

  if (error) {
    errorManage(error);
  } else {
    let newBills = await getPatientBillData(patientid);
    renderpatientBill(patientid, newBills);
  }
}

//get datas from bills table and return data or null
async function getPatientBillData(patientId) {
  console.log("get bill");
  let { data, error } = await database.from("bills");
  // .select('*')
  // .eq('patient_id',patientId);

  if (error) {
    errorManage(error);
    return null;
  }

  return data;
}

//get user data (loginState) or null as argument
function setAddPatientTab(loginState) {
  if (loginState) {
    addPatientSection.innerHTML = `
      <form action="#">
        <div class="info">
          <input class="fname" type="text" name="fullName" placeholder="نام بیمار"/>
          <input type="text" name="codeNum" placeholder="کد ملی" />
          <input type="text" name="telNum" placeholder="شماره تماس" />
          <input type="text" name="adderes" placeholder="آدرس" />
        </div>
        <button type="button" href="#">افزودن بیمار جدید</button>
      </form>
  `;
    addPatientForm = addPatientSection.querySelector("form");
    let addPatientBtn = addPatientSection.querySelector("button");
    addPatientBtn.addEventListener("click", addPatientToDb);
  } else {
    addPatientSection.innerHTML =
      "<span>ابتدا وارد حساب کاربری خود شوید</span>";
  }
}

// add new patient and rerender table again
async function addPatientToDb() {
  console.log("add");
  let fullName = addPatientForm.elements.fullName.value;
  let codeNum = addPatientForm.elements.codeNum.value;
  let telNum = addPatientForm.elements.telNum.value;
  let adderes = addPatientForm.elements.adderes.value;
  let nurse_id = database.auth.user().id;
  // console.log(fullName,codeNum,telNum,adderes);

  let { error } = await database
    .from("patients")
    .insert([{ fullName, codeNum, telNum, adderes, nurse_id }], {
      returning: "minimal",
    });

  if (error) {
    errorManage(error);
  } else {
    let patients = isLogin ? await getPatientsData(isLogin.id) : [];
    setLoginContent( database.auth.user(), patients);
    setTableContent( database.auth.user(), patients);
  }
}

async function deletePatientFromDb(patientId){
  console.log("delete patient");

  let { billsData, billsError } = await database
  .from('bills')
  .delete()
  .match({ patient_id: patientId })

  let { patientData, patientError } = await database
  .from('patients')
  .delete()
  .match({ id: patientId })


  if (patientError) {
    errorManage(patientError);
  }else if(billsError){
    errorManage(billsError);
  } else {
    let patients = await getPatientsData();
    setLoginContent( database.auth.user(), patients);
    setTableContent( database.auth.user(), patients);
  }
}

async function setupApp(loginState) {
  console.log("setup");
  let patients = loginState ? await getPatientsData(loginState.id) : [];

  console.log("patients", patients);

  setLabelLoginTab(loginState);

  setLoginContent(loginState, patients);

  setAddPatientTab(loginState);

  setTableContent(loginState, patients);
}


// addNewBillBtn.addEventListener('click', ()=>{
  
// })
// closeBillsDialogBoxBtn.addEventListener('click', ()=>{
  
// })