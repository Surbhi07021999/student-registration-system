/* Student Registration System
   Features:
   - Add / Edit / Delete records
   - Validation: name letters-only, id numeric, contact 10+ digits, email valid
   - Persist in localStorage
   - Dynamic vertical scrollbar appears when content grows (handled via CSS max-height + JS class toggling)
*/

const form = document.getElementById('studentForm');
const nameInput = document.getElementById('name');
const idInput = document.getElementById('studentId');
const emailInput = document.getElementById('email');
const contactInput = document.getElementById('contact');
const tableBody = document.getElementById('tableBody');
const saveBtn = document.getElementById('saveBtn');
const resetBtn = document.getElementById('resetBtn');
const tableWrapper = document.getElementById('tableWrapper');

let students = []; // in-memory array
let editIndex = -1; // -1 means adding new

// Load from localStorage
function load(){
  const raw = localStorage.getItem('students');
  if(raw){
    try{ students = JSON.parse(raw) }catch(e){ students = [] }
  }
  renderTable();
}

// Save to localStorage
function persist(){
  localStorage.setItem('students', JSON.stringify(students));
}

// Validation helpers
function isNameValid(name){ return /^[A-Za-z\s]+$/.test(name.trim()); }
function isNumeric(val){ return /^\d+$/.test(val); }
function isEmailValid(email){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
function isContactValid(contact){ return /^\d{10,}$/.test(contact); }

// Clear form
function clearForm(){ form.reset(); editIndex = -1; saveBtn.textContent = 'Add Student'; }

// Render table rows
function renderTable(){
  tableBody.innerHTML = '';
  if(students.length === 0){
    const tr = document.createElement('tr');
    tr.innerHTML = '<td colspan="5" style="text-align:center;color:#6b7280;padding:18px">No students registered yet.</td>';
    tableBody.appendChild(tr);
  } else {
    students.forEach((s, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${escapeHtml(s.name)}</td>
        <td>${escapeHtml(s.studentId)}</td>
        <td>${escapeHtml(s.email)}</td>
        <td>${escapeHtml(s.contact)}</td>
        <td class="actions-cell">
          <button class="btn-edit" data-idx="${idx}">Edit</button>
          <button class="btn-delete" data-idx="${idx}">Delete</button>
        </td>`;
      tableBody.appendChild(tr);
    });
  }

  // Add dynamic scrollbar class if content height exceeds wrapper
  requestAnimationFrame(() => {
    if(tableWrapper.scrollHeight > tableWrapper.clientHeight) tableWrapper.classList.add('has-scroll');
    else tableWrapper.classList.remove('has-scroll');
  });
}

// Escape HTML to prevent injection
function escapeHtml(text){ return String(text).replace(/[&"'<>]/g, c => ({'&':'&amp;','"':'&quot;',"'":'&#39;','<':'&lt;','>':'&gt;'})[c]); }

// Form submit handler
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = nameInput.value.trim();
  const studentId = idInput.value.trim();
  const email = emailInput.value.trim();
  const contact = contactInput.value.trim();

  // Validate
  if(!name || !studentId || !email || !contact){ alert('Please fill all fields.'); return; }
  if(!isNameValid(name)){ alert('Name should contain only letters and spaces.'); return; }
  if(!isNumeric(studentId)){ alert('Student ID must be numeric.'); return; }
  if(!isEmailValid(email)){ alert('Please enter a valid email address.'); return; }
  if(!isContactValid(contact)){ alert('Contact number must be at least 10 digits and numeric.'); return; }

  // Prevent duplicate empty rows: check unique studentId
  const duplicateIndex = students.findIndex(s => s.studentId === studentId);
  if(editIndex === -1 && duplicateIndex !== -1){
    if(!confirm('A student with this ID already exists. Do you want to add anyway?')) return;
  }

  const studentObj = { name, studentId, email, contact };

  if(editIndex === -1){
    students.push(studentObj);
  } else {
    students[editIndex] = studentObj;
  }

  persist();
  renderTable();
  clearForm();
});

// Reset button
resetBtn.addEventListener('click', clearForm);

// Delegate edit/delete buttons
tableBody.addEventListener('click', (e) => {
  const editBtn = e.target.closest('.btn-edit');
  const delBtn = e.target.closest('.btn-delete');
  if(editBtn){
    const idx = Number(editBtn.dataset.idx);
    startEdit(idx);
  }
  if(delBtn){
    const idx = Number(delBtn.dataset.idx);
    if(confirm('Delete this record?')){
      students.splice(idx,1);
      persist();
      renderTable();
    }
  }
});

function startEdit(idx){
  const s = students[idx];
  nameInput.value = s.name;
  idInput.value = s.studentId;
  emailInput.value = s.email;
  contactInput.value = s.contact;
  editIndex = idx;
  saveBtn.textContent = 'Save Changes';
  // Focus first field
  nameInput.focus();
}

// run load on start
load();

// Accessibility: allow Enter key to submit when in inputs (handled by form)
// End of script