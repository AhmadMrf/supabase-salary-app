import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://evcestdvcdqmklxwirmp.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2Y2VzdGR2Y2RxbWtseHdpcm1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NTMzMDk2ODUsImV4cCI6MTk2ODg4NTY4NX0.TsUgJIRuIavxbvz0Ez-sdJ9uuaQHcIGuWrD5lUjHnrw";
const database = createClient(supabaseUrl, supabaseKey);

const loginLabel = document.querySelector("#login-label");
const loginContent = document.querySelector("#login-content");
const addPatient = document.querySelector("#add-patient-form");
const tbody = document.querySelector("table > tbody");

let loginForm;
let login_logout_btn;
let emailValue;
let passwordValue;
let fullNameValue;
let jobValue;
let loginBtn;

setupApp(isLogin());

//check localstorage for an active user
// if user exist return user
// if user not exist reutrn null
function isLogin() {
  console.log("is login");
  let localUser = JSON.parse(localStorage.getItem("supabase.auth.token"));
  if (localUser) {
    let {
      currentSession: { user },
    } = localUser;
    return user;
  } else {
    return localUser;
  }
}

// if sign in retun user info
// if error return  error obj
async function signInAccount() {
  console.log("signin");
  emailValue = loginForm.elements.email;
  passwordValue = loginForm.elements.password;

  const { user, error } = await database.auth.signIn({
    email: emailValue.value,
    password: passwordValue.value,
  });
  // console.log(typeof error);
  if (error) {
    errorManage(error);
  }
  return user;
}

//if signup return user info
//if error return error obj
async function signUpAccount() {
  console.log("signup");
  emailValue = loginForm.elements.email;
  passwordValue = loginForm.elements.password;
  fullNameValue = loginForm.elements.fullName;
  jobValue = loginForm.elements.job;

  const { user, session, error } = await database.auth.signUp(
    {
      email: "me1@email.com",
      password: "123456",
    },
    {
      data: {
        fullName: "علی باقری",
        job: "پرستار",
      },
    }
  );
}

// sign out user and return null
async function signOutAccount() {
  console.log("signout");
  // let activeSession = await database.auth.session();
  let { currentSession } = JSON.parse(
    localStorage.getItem("supabase.auth.token")
  );
  return await database.auth.signOut(currentSession.access_token);
}

//
function errorManage(errorMassage) {
  console.log("error manage");
  console.log(errorMassage, "مدیریت خطا");
}

//give user id
// return datas form database
//if exist error return error obj and null instead of datas
async function getPatientsData(id) {
  console.log("get");
  let { data, error } = await database.from("patients");
  if (error) {
    errorManage(error);
    return null;
  }
  return data;
}

// change betwean sign in and sign out and call setupApp again
async function changeSignState() {
  console.log("click btn");

  if (isLogin()) {
    // sign out btn active
    let { error } = await signOutAccount();
    if (error) {
      console.log("has error", error);
    } else {
      console.log("no error", error);
      setupApp(error);
    }
  } else {
    //sign in btn active
    let userData = await signInAccount();
    if (userData) {
      setupApp(userData);
    } else {
      console.log(userData, " خطا");
    }
  }
}


function setLoginLabel(loginState){
  loginLabel.textContent = loginState
  ? `درمانگر : ${loginState.user_metadata.fullName}`
  : "ورود - ثبت نام";

}


function setLoginContent(loginState,patients){
  loginContent.innerHTML = loginState
    ? `
      <div class="panel-account">
        <div class="panel-info">
          <span>${loginState.user_metadata.fullName}</span>
          <span>${loginState.user_metadata.job}</span>
          <span>تعداد بیماران : <span id="patient-number" >${
            patients ? patients.length : "-"
          }</span></span>
        </div>
        <button type="button" href="#">خروج</button>
      </div>
  `
    : `
      <form action="#">
        <div class="info">
          <input type="email" name="email" placeholder="ایمیل" />
          <input type="password" name="password" placeholder="رمز ورود" />
          <input class="nurse-data" type="text" name="fullName" placeholder="نام و نام خانوادگی" />
          <input class="nurse-data" type="text" name="job" placeholder="سمت و شغل" />
        </div>
        <button type="button" href="#">ورود یا ثبت نام</button>
        <a href="#">فراموشی رمز عبور </a>
      </form>
  `;
  loginForm = loginContent.querySelector("form");
  login_logout_btn = loginContent.querySelector("button");
  return {loginForm,login_logout_btn}

}


function setTableContent(loginState,patients){
  if (loginState) {
    if (!patients) {
      tbody.innerHTML =
      `<tr>
      <td class="fake-td" colspan="4">اختلال در دریافت اطلاعات بیماران </td>
      <td class="fake-td" colspan="2"><button id="refreshBtn" >مجدد تلاش کنید</button></td>
      </tr>`
      ;
      document.querySelector('#refreshBtn').addEventListener('click', ()=>setupApp(isLogin()))
    } else {
      tbody.innerHTML = patients
        .map((patient, i) => {
          return (patient = `<tr>
            <td class="column1">${+i + 1}</td>
            <td class="column2">${patient.fullName}</td>
            <td class="column3">${patient.telNum}</td>
            <td class="column4">${patient.visit + patient.equip}</td>
            <td class="column5">${patient.income}</td>
            <td class="column6"><button>ویرایش </button></td>
            </tr>`);
        })
        .join("");
    }
  } else {
    tbody.innerHTML =
      '<tr><td class="fake-td" colspan="6">برای مشاهده اطلاعات وارد حساب کاربری خود شوید</td></tr>';
}
}


function setAddPatient(loginState){
  addPatient.innerHTML = loginState
    ? `
      <form action="#">
        <div class="info">
          <input class="fname" type="text" name="name" placeholder="نام بیمار"/>
          <input type="text" name="name" placeholder="کد ملی" />
          <input type="text" name="name" placeholder="شماره تماس" />
          <input type="text" name="name" placeholder="آدرس" />
        </div>
        <button href="#">افزودن بیمار جدید</button>
      </form>
  `
    : "<span>ابتدا وارد حساب کاربری خود شوید</span>";
}


async function setupApp(loginState) {
  console.log("setup");
  let patients = loginState ? await getPatientsData(loginState.id) : [];

  console.log(patients);

  setLoginLabel(loginState)

  let {loginForm, login_logout_btn} = setLoginContent(loginState,patients)

  
  login_logout_btn.addEventListener("click", changeSignState);

  setAddPatient(loginState)

  setTableContent(loginState,patients)
  
}

// const c = await database.auth.update({
//   email: "me1@email.com",
//   password: "0123456",
//   data: { fullName:'علی باقری',job:' کارشناس زخم' }
// })

// let c = await database.auth.signOut()

// console.log(isLogin);
