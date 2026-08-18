document.getElementById("birthdate")
.addEventListener("change", function () {
 let birthdate = new Date(this.value);
 let today = new Date();
 let age = today.getFullYear() - birthdate.getFullYear();
 let month = today.getMonth() - birthdate.getMonth();
 if (month < 0 ||
 (month === 0 && today.getDate() < birthdate.getDate())) {
 age--;
 }
 document.getElementById("age").value = age;
});
// COPY CURRENT ADDRESS
document.getElementById("sameAddress")
.addEventListener("change", function () {
 if (this.checked) {
 document.getElementById("permanentHouseNo").value =
 document.getElementById("currentHouseNo").value;
 document.getElementById("permanentStreet").value =
 document.getElementById("currentStreet").value;
 document.getElementById("permanentBarangay").value =
 document.getElementById("currentBarangay").value;
 document.getElementById("permanentAddress").style.display = "none";
 } else {
 document.getElementById("permanentAddress").style.display = "block";
 } });
// FORM SUBMISSION
document.getElementById("registrationForm")
.addEventListener("submit", function (event) {
 event.preventDefault();
 alert("Registration form submitted successfully!");
});