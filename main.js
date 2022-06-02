import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://evcestdvcdqmklxwirmp.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2Y2VzdGR2Y2RxbWtseHdpcm1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NTMzMDk2ODUsImV4cCI6MTk2ODg4NTY4NX0.TsUgJIRuIavxbvz0Ez-sdJ9uuaQHcIGuWrD5lUjHnrw";
const database = createClient(supabaseUrl, supabaseKey);

const loginLabel = document.querySelector("#login-label");
const loginContent = document.querySelector("#login-content");
const addPatient = document.querySelector("#add-patient-form");
const tbody = document.querySelector("table > tbody");

let signinForm;  //declare in setLoginContent func
let signupForm;  //declare in setLoginContent func
let signoutBtn;  //declare in setLoginContent func


let isLogin = database.auth.user()  // return null or user data
console.log(isLogin);

//toggle between sign in and sign up form
loginContent.addEventListener('click', e => {
  if(e.target.classList.contains('hidden')){
   let forms = loginContent.children
    forms[0].classList.toggle('hidden')
    forms[1].classList.toggle('hidden')
  }
})

// setup app in first run
setupApp(isLogin);

// if sign in done , return user info
// if error call errorManage func
async function signInAccount() {
  console.log("signin");
  let emailValue;
  let passwordValue;

  
  emailValue = signinForm.elements.email.value;
  passwordValue = signinForm.elements.password.value;
  
  const { user, error } = await database.auth.signIn({
    email: emailValue,
    password: passwordValue,
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
  let emailValue;
  let passwordValue;
  let fullNameValue;
  let jobValue;
  emailValue = signupForm.elements.email.value;
  passwordValue = signupForm.elements.password.value;
  fullNameValue = signupForm.elements.fullName.value;
  jobValue = signupForm.elements.job.value;

  const { user, error } = await database.auth.signUp(
    {
      email: emailValue,
      password: passwordValue,
    },
    {
      data: {
        fullName: fullNameValue,
        job: jobValue,
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
function errorManage(errorMassage) {
  console.log("error manage");
  console.log(errorMassage, "مدیریت خطا");
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

  switch(stat) {
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
function setLabelLoginTab(loginState){
  loginLabel.textContent = loginState
  ? `درمانگر : ${loginState.user_metadata.fullName}`
  : "ورود - ثبت نام";
}

//get user data (loginState) or null and patients (patients array) as argument
//and 1- set inner content 2- declare signoutBtn and signinForm 3- add event listener to buttons
function setLoginContent(loginState,patients){
  if(loginState){
    loginContent.innerHTML = 
     `
      <div class="panel-account">
        <div class="panel-info">
          <span>${loginState.user_metadata.fullName}</span>
          <span>${loginState.user_metadata.job}</span>
          <span>تعداد بیماران : <span id="patient-number" >${
            patients ? patients.length : "-"
          }</span></span>
        </div>
        <button name="signoutBtn" type="button" href="#">خروج</button>
      </div>
  `;
    signoutBtn = loginContent.querySelector("button");
    signinForm = null
    signupForm = null   

    signoutBtn.addEventListener("click", ()=> changeSignState("signout"));

    // return {signinForm,signupForm,signoutBtn}

  }else{
    loginContent.innerHTML = 
    `
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

   signinForm.elements.signinBtn.addEventListener("click", ()=> changeSignState("signin"));
   signupForm.elements.signupBtn.addEventListener("click", ()=> changeSignState("signup"));

   signoutBtn = null

  //  return {signinForm,signupForm,signoutBtn} 

  }

}

//get user data (loginState) or null and patients (patients array) as argument
// and fill rows based on patients info from database
function setTableContent(loginState,patients){
  if (loginState) {
    if (!patients) {
      tbody.innerHTML =
      `<tr>
      <td class="fake-td" colspan="4">اختلال در دریافت اطلاعات بیماران </td>
      <td class="fake-td" colspan="2"><button id="refreshBtn" >مجدد تلاش کنید</button></td>
      </tr>`
      ;
      document.querySelector('#refreshBtn').addEventListener('click', ()=>setupApp(isLogin))
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

//get user data (loginState) or null as argument
function setAddPatientTab(loginState){
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

  console.log("patients num",patients.length);

  setLabelLoginTab(loginState)

  setLoginContent(loginState,patients)

  setAddPatientTab(loginState)

  setTableContent(loginState,patients)
  
}
