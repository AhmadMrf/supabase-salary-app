import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://evcestdvcdqmklxwirmp.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2Y2VzdGR2Y2RxbWtseHdpcm1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NTMzMDk2ODUsImV4cCI6MTk2ODg4NTY4NX0.TsUgJIRuIavxbvz0Ez-sdJ9uuaQHcIGuWrD5lUjHnrw";
const database = createClient(supabaseUrl, supabaseKey);

const wrapper = document.querySelector(".limiter");
const topBarContent = document.querySelector(".top-bar-content");
const loginLabel = document.querySelector("#login-label");
const loginContent = document.querySelector("#login-content");
const patientTbody = document.querySelector("table > tbody");
const addPatientSection = document.querySelector("#add-patient-form");
const patientBill = document.querySelector(".patient-bills");
const dialogBillTbody = patientBill.querySelector("tbody");
const deleteConfirmBox = document.querySelector(".delete-confirm");
const editConfirmBox = document.querySelector(".edit-confirm");
let deleteYesBtn = null;
let editYesBtn = null;
let confirmNoBtn = null;

let errorBox = document.querySelector("#error-box");

let signinForm;
let signupForm;
let signoutBtn;
let addPatientForm;

// return null or user data
async function checkUser() {
  let user = database.auth.user();
  if (!user) return null;
  let [userData] = await getUserFromDb();
  return { ...user, userData };
}

let loggedInUser = await checkUser();

console.log("islog?", loggedInUser);

//toggle between sign in and sign up form
loginContent.addEventListener("click", (e) => {
  if (e.target.classList.contains("hidden")) {
    let forms = loginContent.children;
    forms[0].classList.toggle("hidden");
    forms[1].classList.toggle("hidden");
  }
});

// setup app in first run
setupApp(loggedInUser);

//manage errors
//show an box with error message
function errorManage(errorMessage) {
  console.log("error manage");
  errorBox.style.display = "block";
  errorBox.innerHTML = errorMessage.message;
  setTimeout(() => {
    errorBox.innerHTML = "";
    errorBox.style.display = "none";
  }, 5000);
}

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

  if (error) {
    errorManage(error);
    return null;
  } else {
    loggedInUser = await checkUser();
    signinForm.reset();
    console.log(loggedInUser);

    return loggedInUser;
  }
}

//if signup return user info
//if error call errorManage func
async function signUpAccount() {
  console.log("signup", loggedInUser);
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
    }
    // },
    // {
    //   data: {
    //     fullName,
    //     job,
    //   },
    // }
  );
  if (error) {
    errorManage(error);
    return null;
  } else {
    let [userData] = await addUserDataToDb({ id: user.id, fullName, job });
    loggedInUser = { ...user, userData };
    signinForm.reset();
    console.log(loggedInUser);
    return loggedInUser;

    // let userData = await addUserDataToDb({ id: user.id, fullName, job });
    // signupForm.reset();
    // console.log(userData);
    // let {
    //   data: [{ fullName: userFullName, job: userJob }],
    // } = userData;
    // return { ...user, userFullName, userJob };
  }
}

// sign out user and return null
async function signOutAccount() {
  console.log("signout");
  let activeSession = database.auth.session();
  return await database.auth.signOut(activeSession.access_token);
}

//get a 'string' as argument
// change between signin , signup and signout and call setupApp again or call errorManage func
async function changeSignState(state, clickedBtn) {
  console.log("click btn");

  let userData;

  switch (state) {
    case "signin":
      // sign in btn active
      clickedBtn.classList.add("preloader-btn");
      userData = await signInAccount();
      if (userData) {
        await setupApp(userData);
      } else {
        clickedBtn.classList.remove("preloader-btn");
        console.log(userData, " خطا");
      }
      break;
    case "signup":
      // sign up btn active
      clickedBtn.classList.add("preloader-btn");
      userData = await signUpAccount();
      if (userData) {
        await setupApp(userData);
      } else {
        clickedBtn.classList.remove("preloader-btn");
        console.log(userData, " خطا");
      }
      break;
    default:
      // sign out btn active
      clickedBtn.classList.add("preloader-btn");
      let { error } = await signOutAccount();
      if (error) {
        clickedBtn.classList.remove("preloader-btn");
        console.log("has error", error);
      } else {
        console.log("no error", error);
        setupApp(null);
      }
  }
}

async function getUserFromDb() {
  let { data, error } = await database.from("us");
  if (error) {
    errorManage(error);
    return null;
  }
  console.log("getuser");
  return data;
}

async function addUserDataToDb(userData) {
  // let { id, fullName, job, telNum, introducer } = userData;
  console.log("adduser");
  let { data } = await database.from("us").insert([userData]);
  return data;
  // if (error) errorManage(error);
}
// document.body.addEventListener("click", async () => {
//   let a = await addUserDataToDb({ id: loggedInUser.id, fullName: "new", job: "new", tellNum: 123 });
//   console.log(a);
// });
//if success return data form database
//if error return null and call errorManage func
async function getPatientsFromDb() {
  console.log("get");
  let { data, error } = await database.from("patients");
  if (error) {
    errorManage(error);
    return null;
  }
  return data;
}

// add new patient and rerender table again
async function addPatientToDb() {
  console.log("add");
  let fullName = addPatientForm.elements.fullName.value;
  let codeNum = addPatientForm.elements.codeNum.value;
  let telNum = addPatientForm.elements.telNum.value;
  let adderes = addPatientForm.elements.adderes.value;
  let nurse_id = loggedInUser.id;

  let { error } = await database.from("patients").insert([{ fullName, codeNum, telNum, adderes, nurse_id }], {
    returning: "minimal",
  });

  if (error) {
    errorManage(error);
  } else {
    let user = loggedInUser;
    let patients = user ? await getPatientsFromDb() : [];

    setLoginTabContent(user, patients);
    setPatientsTable(user, patients);
    addPatientForm.reset();
  }
}

//remove patient ( and bills)
async function deletePatientFromDb(patientid) {
  console.log("delete patient");

  let { billsData, billsError } = await database.from("bills").delete().match({ patient_id: patientid });

  let { patientData, patientError } = await database.from("patients").delete().match({ id: patientid });

  if (patientError) {
    errorManage(patientError);
  } else if (billsError) {
    errorManage(billsError);
  } else {
    let user = loggedInUser;
    let patients = await getPatientsFromDb();
    setLoginTabContent(user, patients);
    setPatientsTable(user, patients);
  }
}

//edit patients
async function editPatientFromDb(patientid, editedPatient) {
  console.log("edit patient");
  const { error, data } = await database.from("patients").update(editedPatient).eq("id", patientid);

  if (error) {
    errorManage(error);
  } else {
    let user = loggedInUser;
    let patients = user ? await getPatientsFromDb() : [];

    setLoginTabContent(user, patients);
    setPatientsTable(user, patients);
  }
}

//remove bill for each patient from bills table on database
async function deleteBillFromDb(billid, patientid) {
  console.log("delete bill");

  let { billData, billError } = await database.from("bills").delete().match({ id: billid });

  if (billError) {
    errorManage(billError);
  } else {
    let newBills = await getPatientBillData(patientid);
    renderpatientBill(patientid, newBills);
  }
}

// edit bills
async function editBillFromDb(billid, patientid, editedBill) {
  console.log("edit bill");
  const { error, data } = await database.from("bills").update(editedBill).eq("id", billid);

  if (error) {
    errorManage(error);
  } else {
    let newBills = await getPatientBillData(patientid);
    renderpatientBill(patientid, newBills);
  }
}

//add bill for each patient to bills table on database
async function addBillToDb(billData) {
  console.log("add bill");
  let { patient_id: patientid } = billData;
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
async function getPatientBillData(patientid) {
  console.log("get bill");
  let { data, error } = await database.from("bills");

  if (error) {
    errorManage(error);
    return null;
  }

  return data;
}

//set label of login tab
function setLabelLoginTab(loggedInUser) {
  loginLabel.textContent = loggedInUser ? `درمانگر : ${loggedInUser.userData.fullName}` : "ورود - ثبت نام";
}

//get user data (loggedInUser) or null and patients (patients array) as argument
//and 1- set inner content 2- declare signoutBtn and signinForm 3- add event listener to buttons
function setLoginTabContent(loggedInUser, patients) {
  if (loggedInUser) {
    //show details of user data in login tab
    // and show sign out button
    loginContent.innerHTML = `
      <div class="panel-account">
      <img src="./pic.jpg" alt="user picture" >
        <div class="panel-info">
          <span>${loggedInUser.userData.fullName}</span>
          <span>${loggedInUser.userData.job}</span>
          <span>تعداد بیماران : <span id="patient-number" >${patients ? patients.length : "-"}</span></span>
        </div>
        <button name="signoutBtn" type="button" href="#">خروج</button>
      </div>
  `;
    signoutBtn = loginContent.querySelector("button");
    signinForm = null;
    signupForm = null;

    signoutBtn.addEventListener("click", (e) => {
      changeSignState("signout", e.currentTarget);
    });
  } else {
    // show forms for sign in or sign up
    // and set event for forms buttons
    loginContent.innerHTML = `
    <form data-type="ورود" action="#">
      <div class="info">
        <input  required type="email" name="email" placeholder="ایمیل" />
        <input  required type="password" name="password" placeholder="رمز ورود" />
      </div>
      <button name="signinBtn" type="submit" href="#">ورود</button>
      <a href="#">فراموشی رمز عبور </a>
    </form>

    <form class=" hidden"  data-type="ثبت نام" action="#">
      <div class="info">
        <input  required type="email" name="email" placeholder="ایمیل" />
        <input  required type="password" name="password" placeholder="رمز ورود" />
        <input  required type="text" name="fullName" placeholder="نام و نام خانوادگی" />
        <input  required type="text" name="job" placeholder="سمت و شغل" />
      </div>
      <button name="signupBtn" type="submit" href="#"> ثبت نام</button>
    </form>
`;
    signinForm = loginContent.querySelectorAll("form")[0];
    signupForm = loginContent.querySelectorAll("form")[1];

    signinForm.elements.signinBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (!isFormValid(signinForm)) {
        return;
      }
      changeSignState("signin", e.currentTarget);
    });
    signupForm.elements.signupBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (!isFormValid(signupForm)) {
        // errorManage({ message: "فرم به درستی تکمیل نشده ." });
        return;
      }
      changeSignState("signup", e.currentTarget);
    });

    signoutBtn = null;
  }
}

//get user data (loggedInUser) or null and patients (patients array) as argument
// and fill rows based on patients info from database
async function setPatientsTable(loggedInUser, patients) {
  if (loggedInUser) {
    // if patients exist
    if (patients) {
      // preloader added
      patientTbody.innerHTML = patients.map((trs) => '<tr class="preloader-box"></tr>').join("");

      let bills = await getPatientBillData();

      // return total of cost and incomes for each patient
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

      //fill table with patient data
      patientTbody.innerHTML = patients
        .map((patient, i) => {
          ({ cost, incomes, billsLength } = totalCost(patient.id));
          return (patient = `<tr>
          <td class="column1">${+i + 1}</td>
          <td class="column2">${patient.fullName}</td>
          <td class="column3">${patient.telNum}</td>
          <td class="column4">${cost ?? 0}</td>
          <td class="column5">${incomes ?? 0}</td>
          <td class="column7">
            <button class="delete-patient" data-patientid="${patient.id}" >حذف</button>
            <button class="edit-patient" data-patientid="${patient.id}" >اصلاح</button>
            <button class="edit-bills" data-patientid="${patient.id}" > صورت حساب <span>(${billsLength})<span> </button></td>
          </tr>`);
        })
        .join("");

      //add event listener for edit buttons
      let editPatients = patientTbody.querySelectorAll(".edit-patient");
      editPatients.forEach((editPatient) => {
        editPatient.addEventListener("click", (e) => {
          manageConfirms("edit", { patients: true, allPatients: patients, patientid: e.target.dataset.patientid });
        });
      });

      //add event listener for delete buttons
      let deletePatients = patientTbody.querySelectorAll(".delete-patient");
      deletePatients.forEach((deletePatient) => {
        deletePatient.addEventListener("click", (e) => {
          manageConfirms("delete", { patients: true, allPatients: patients, patientid: e.target.dataset.patientid });
        });
      });

      let editBills = patientTbody.querySelectorAll(".edit-bills");
      editBills.forEach((editBtn) => {
        editBtn.addEventListener("click", (e) => setPatientBillsDialogContent(e, patients, bills));
      });

      if (!patients.length) {
        patientTbody.innerHTML = `<tr>
       <td class="fake-td" colspan="4">شما هنوز بیماری ثبت نکرده اید . </td>
       <td class="fake-td" colspan="2"><label for="add-patient">افزودن بیمار جدید </label></td>
       </tr>`;
      }
    } else {
      patientTbody.innerHTML = `<tr>
      <td class="fake-td" colspan="4">اختلال در دریافت اطلاعات بیماران </td>
      <td class="fake-td" colspan="2"><button id="refreshBtn" >مجدد تلاش کنید</button></td>
      </tr>`;
      document.querySelector("#refreshBtn").addEventListener("click", () => setupApp(loggedInUser));
    }
  } else {
    patientTbody.innerHTML = '<tr><td class="fake-td" colspan="6">برای مشاهده اطلاعات وارد حساب کاربری خود شوید</td></tr>';
  }
}

//with click on any patient is opening a dialog box with that patient info
//so filter and show bills that are relative to that patient
// and add event listener to close btn
async function setPatientBillsDialogContent(e, patients, patientBillData) {
  patientBill.classList.remove("hidden");
  let selectedPatient = patients.find((patient) => patient.id == e.target.dataset.patientid);

  const patientFullname = patientBill.querySelector("#patient-fullname");
  const patientCodenum = patientBill.querySelector("#patient-codenum");
  const patientTelnum = patientBill.querySelector("#patient-telnum");
  const patientAdderes = patientBill.querySelector("#patient-adderes");
  const addBillForm = patientBill.querySelector("form");
  const closeBillDialogBtn = patientBill.querySelector("#close-bill-btn");
  const addNewBillBtn = patientBill.querySelector("#add-bill");

  patientFullname.innerHTML = selectedPatient.fullName;
  patientCodenum.innerHTML = selectedPatient.codeNum;
  patientTelnum.innerHTML = selectedPatient.telNum;
  patientAdderes.innerHTML = selectedPatient.adderes;
  addBillForm.elements.date.valueAsDate = new Date();

  renderpatientBill(selectedPatient.id, patientBillData);

  function closeBillDialog() {
    patientBill.classList.add("hidden");
    dialogBillTbody.innerHTML = "";
    setPatientsTable(loggedInUser, patients);
    addNewBillBtn.removeEventListener("click", addNewBill);
    closeBillDialogBtn.removeEventListener("click", closeBillDialog);
  }

  async function addNewBill() {
    if (!isFormValid(addBillForm)) {
      return;
    }
    addNewBillBtn.classList.add("preloader-btn");
    let newBillData = {
      created_at: addBillForm.elements.date.valueAsDate || new Date(),
      patient_id: selectedPatient.id,
      nurse_id: loggedInUser.id,
      visit: addBillForm.elements.visit.value == "" ? 0 : addBillForm.elements.visit.value,
      income: addBillForm.elements.income.value == "" ? 0 : addBillForm.elements.income.value,
      equipment: addBillForm.elements.equipment.value == "" ? 0 : addBillForm.elements.equipment.value,
      desc: addBillForm.elements.desc.value,
    };
    await addBillToDb(newBillData);
    addBillForm.reset();
    addNewBillBtn.classList.remove("preloader-btn");
  }

  closeBillDialogBtn.addEventListener("click", closeBillDialog);
  addNewBillBtn.addEventListener("click", addNewBill);
}

//render bills table for each patient that selected . and add event listener on buttons
function renderpatientBill(patientid, bills) {
  console.log("renderbill");
  let patientBills = bills.filter((bill) => {
    return bill.patient_id == patientid;
  });
  let dialogBillContent = patientBills
    .map((bill, i) => {
      return `
    <tr>
        <td class="column1">${+i + 1}</td>
        <td class="column2">${new Date(bill.created_at).toLocaleString("fa", {
          dateStyle: "short",
        })}</td>
        <td class="column3">${bill.visit}</td>
        <td class="column4">${bill.equipment}</td>
        <td class="column5">${bill.income}</td>
        <td class="column6">${bill.desc || " - "}</td>
        <td class="column7">
          <button class="edit-bill" data-bill="${bill.id}" >اصلاح</button>
          <button class="delete-bill" data-bill="${bill.id}" >حذف</button>
        </td>
    </tr>
    `;
    })
    .join("");

  if (dialogBillContent) {
    dialogBillTbody.innerHTML = dialogBillContent;

    let editBills = dialogBillTbody.querySelectorAll(".edit-bill");
    editBills.forEach((editBill) => {
      editBill.addEventListener("click", (e) => {
        manageConfirms("edit", { bills: true, patientBills, patientid, billid: e.target.dataset.bill });
      });
    });
    let removeBills = dialogBillTbody.querySelectorAll(".delete-bill");
    removeBills.forEach((removeBill) => {
      removeBill.addEventListener("click", (e) => {
        manageConfirms("delete", { bills: true, patientBills, patientid, billid: e.target.dataset.bill });
      });
    });
  } else {
    dialogBillTbody.innerHTML = `<tr>
       <td colspan="6" class="fake-td">هنوز صورت حسابی ثبت نشده .</td>
    </tr>`;
  }
}

//get user data (loggedInUser) or null as argument
function setAddPatientTabContent(loggedInUser) {
  if (loggedInUser) {
    addPatientSection.innerHTML = `
      <form action="#"> 
        <div class="info">
          <input class="fname" type="text" name="fullName" placeholder="نام بیمار"/>
          <input type="text" name="codeNum" placeholder="کد ملی" />
          <input type="tel" name="telNum" placeholder="شماره تماس" />
          <input type="text" name="adderes" placeholder="آدرس" />
        </div>
        <button type="submit" href="#">افزودن بیمار جدید</button>
      </form>
  `;
    addPatientForm = addPatientSection.querySelector("form");
    let addPatientBtn = addPatientSection.querySelector("button");
    addPatientBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      if (!isFormValid(addPatientForm)) {
        return;
      }
      addPatientBtn.classList.add("preloader-btn");
      await addPatientToDb();
      addPatientBtn.classList.remove("preloader-btn");
    });
  } else {
    addPatientSection.innerHTML = "<span>ابتدا وارد حساب کاربری خود شوید</span>";
  }
}

//valid forms
// get a form as argument and return true if valid and false if not valid
//if be invalid show message box during 3 sec
function isFormValid(form) {
  let typeAttribute;
  let inputValue;
  let isValid = true;
  let showAlertTime = 3000;
  function invalidAlert(input, alert) {
    let ShowAlert = !input.classList.contains("invalid-alert");
    isValid = false;
    if (ShowAlert) {
      let errorAlert = `<span class='invalid-alert-msg'>${alert}</spsn>`;
      input.classList.add("invalid-alert");
      input.insertAdjacentHTML("beforebegin", errorAlert);
      setTimeout(() => {
        input.classList.remove("invalid-alert");
        input.previousElementSibling.remove();
      }, showAlertTime);
    }
  }
  [...form.elements].forEach((item) => {
    typeAttribute = item.getAttribute("type");
    inputValue = item.value;
    switch (typeAttribute) {
      case "email":
        if (
          !inputValue
            .toLowerCase()
            .match(
              /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            )
        ) {
          invalidAlert(item, "ایمیل به درستی وارد نشده");
        }
        break;

      case "password":
        if (inputValue.length <= 5) {
          invalidAlert(item, "حداقل 6 کارکتر وارد کنید");
        }
        break;

      case "number":
        if (inputValue.length > 12 || inputValue < 0) {
          invalidAlert(item, "اعداد منفی و بیشتر از 12 عدد مجاز نیست");
        }
        break;

      case "tel":
        if (inputValue.length < 10 || inputValue.length > 11 || isNaN(inputValue)) {
          invalidAlert(item, "شماره صحیح وارد کنید (با کد شهر)");
        }
        break;

      case "text":
        if (inputValue.length <= 2) {
          invalidAlert(item, "حداقل 3 کارکتر وارد کنید");
        }
        break;
    }
  });
  return isValid;
}

// set content of confirm dialog
//and add event listener for each button > ok or cancel
function manageConfirms(type, Db) {
  let editedData = null;
  wrapper.classList.add("shadow");
  console.log(Db);
  if (type == "delete" && Db.patients) {
    deleteConfirmBox.classList.remove("hidden");
    let patientFullname = Db.allPatients.find((patient) => patient.id === Db.patientid).fullName;
    deleteConfirmBox.innerHTML = `
    <div class="delete-confirm-content">
      <span>
      آیا میخواهید بیمار"
      <span>${patientFullname}</span>" را حذف کنید؟
      </span>
    </div>
    <div class="delete-confirm-btns">
      <button id="delete-yes-btn">حذف</button>
      <button class="confirm-no-btn">انصراف</button>
    </div>
  `;
    console.log("dp_c");
  }
  if (type == "delete" && Db.bills) {
    deleteConfirmBox.classList.remove("hidden");
    deleteConfirmBox.innerHTML = `
    <div class="delete-confirm-content">
      <span >آیا میخواهید این صورت حساب را حذف کنید ؟ </span>
    </div>
    <div class="delete-confirm-btns">
      <button id="delete-yes-btn">حذف</button>
      <button class="confirm-no-btn">انصراف</button>
    </div>
      `;
    console.log("db_c");
  }
  if (type == "edit" && Db.patients) {
    let editedPatient = Db.allPatients.find((editedPatient) => editedPatient.id === Db.patientid);
    editConfirmBox.classList.remove("hidden");
    editConfirmBox.innerHTML = `
    <div class="edit-confirm-content">
        <div id="edit-confirm-patient-text" class="edit-confirm-text hidden">
          <form action="#">
            <span>نام بیمار :<input class="fname" type="text" name="fullName" value="${editedPatient.fullName}" placeholder="" /></span>
            <span>کد ملی :<input type="text" name="codeNum" value="${editedPatient.codeNum}" placeholder="" /></span>
            <span>شماره تماس :<input type="tel" name="telNum" value="${editedPatient.telNum}" placeholder="" /></span>
            <span>آدرس :<input type="text" name="adderes" value="${editedPatient.adderes}" placeholder="" /></span>
          </form>
        </div>
        </div>
        <div class="edit-confirm-btns">
          <button id="edit-yes-btn">اصلاح</button>
          <button class="confirm-no-btn">انصراف</button>
        </div>
        `;
    console.log(Db);
  }
  if (type == "edit" && Db.bills) {
    let editedBill = Db.patientBills.find((editedBill) => editedBill.id == Db.billid);

    editConfirmBox.classList.remove("hidden");
    editConfirmBox.innerHTML = `
    <div class="edit-confirm-content">
      <div id="edit-confirm-bill-text" class="edit-confirm-text hidden">
        <form action="#">
          <!--<span>تاریخ :<input type="text" name="date" value="${new Date(editedBill.created_at).toLocaleString("fa", {
            dateStyle: "short",
          })}" placeholder="" /></span> -->
          <span>ویزیت :<input type="number" name="visit" value="${editedBill.visit}" placeholder="" /></span>
          <span>مصرفی :<input type="number" name="equipment" value="${editedBill.equipment}" placeholder="" /></span>
          <span>دریافتی :<input type="number" name="income" value="${editedBill.income}" placeholder="" /></span>
          <span>توضیحات :<textarea placeholder="" name="desc" id="desc">${editedBill.desc}</textarea></span>
        </form>
      </div>
      </div>
      <div class="edit-confirm-btns">
        <button id="edit-yes-btn">اصلاح</button>
        <button class="confirm-no-btn">انصراف</button>
      </div>
      `;
  }
  let editedForm = editConfirmBox.querySelector("form");
  deleteYesBtn = deleteConfirmBox?.querySelector("#delete-yes-btn");
  editYesBtn = editConfirmBox?.querySelector("#edit-yes-btn");
  confirmNoBtn = document.querySelector(".confirm-no-btn");

  confirmNoBtn.addEventListener("click", hideConfirms);
  editYesBtn
    ? editYesBtn.addEventListener("click", async () => {
        if (!isFormValid(editedForm)) return;
        editYesBtn.classList.add("preloader-btn");
        if (Db.patients) {
          editedData = {
            fullName: editedForm.elements.fullName.value,
            codeNum: editedForm.elements.codeNum.value,
            telNum: editedForm.elements.telNum.value,
            adderes: editedForm.elements.adderes.value,
          };
          await editPatientFromDb(Db.patientid, editedData);
          hideConfirms();
          return;
        }
        editedData = {
          visit: editedForm.elements.visit.value,
          income: editedForm.elements.income.value,
          equipment: editedForm.elements.equipment.value,
          desc: editedForm.elements.desc.value,
        };
        await editBillFromDb(Db.billid, Db.patientid, editedData);
        hideConfirms();
      })
    : null;

  deleteYesBtn
    ? deleteYesBtn.addEventListener("click", async () => {
        deleteYesBtn.classList.add("preloader-btn");
        if (Db.patients) {
          await deletePatientFromDb(Db.patientid);
          hideConfirms();
          return;
        }
        await deleteBillFromDb(Db.billid, Db.patientid);
        hideConfirms();
      })
    : null;
}

async function setupApp(loggedInUser) {
  console.log("setup");
  topBarContent.classList.add("preloader-box");
  let patients = loggedInUser ? await getPatientsFromDb() : [];
  topBarContent.classList.remove("preloader-box");

  console.log("patients", patients);

  setLabelLoginTab(loggedInUser);

  setLoginTabContent(loggedInUser, patients);

  setAddPatientTabContent(loggedInUser);

  setPatientsTable(loggedInUser, patients);
}
// close confirm dialog
function hideConfirms() {
  wrapper.classList.remove("shadow");
  deleteConfirmBox.classList.add("hidden");
  editConfirmBox.classList.add("hidden");
  deleteConfirmBox.innerHTML = "";
  editConfirmBox.innerHTML = "";
  confirmNoBtn.removeEventListener("click", hideConfirms);
}
