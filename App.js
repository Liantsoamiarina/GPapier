const form = document.getElementById("formDepense");
const tableBody = document.getElementById("tableBody");
const searchInput = document.getElementById("searchInput");
const totalPapiers = document.getElementById("totalPapiers");
const submitBtn = document.getElementById("submitBtn");

let depenses = JSON.parse(localStorage.getItem("depenses")) || [];
let indexEdition = null;

// Remplir automatiquement la date du jour
document.addEventListener("DOMContentLoaded", function () {
  const dateInput = document.getElementById("date");
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  dateInput.value = `${yyyy}-${mm}-${dd}`;
});

function afficherDepenses() {
  tableBody.innerHTML = "";
  let total = 0;
  depenses.forEach((dep, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
	<td>${dep.date}</td>
	<td>${dep.service}</td>
	<td>${dep.utilisation}</td>
	<td>${dep.nombre}</td>
	<td>${dep.nom}</td>
	<td>
	  <button class="btn btn-warning btn-sm me-2" onclick="editerDepense(${index})">Modifier</button>
	  <button class="btn btn-danger btn-sm" onclick="supprimerDepense(${index})">Supprimer</button>
	</td>`;
    tableBody.appendChild(row);
    total += parseInt(dep.nombre);
  });
  totalPapiers.textContent = total;
}

function sauvegarder() {
  localStorage.setItem("depenses", JSON.stringify(depenses));
}

function editerDepense(index) {
  const dep = depenses[index];
  document.getElementById("date").value = dep.date;
  document.getElementById("service").value = dep.service;
  document.getElementById("utilisation").value = dep.utilisation;
  document.getElementById("nombre").value = dep.nombre;
  document.getElementById("nom").value = dep.nom;
  indexEdition = index;
  submitBtn.textContent = "Modifier";
  submitBtn.classList.replace("btn-primary", "btn-success");
}

function supprimerDepense(index) {
  if (confirm("Supprimer cette ligne ?")) {
    depenses.splice(index, 1);
    sauvegarder();
    afficherDepenses();
  }
}

form.addEventListener("submit", function (e) {
  e.preventDefault();
  const nouvelleDepense = {
    date: document.getElementById("date").value,
    service: document.getElementById("service").value,
    utilisation: document.getElementById("utilisation").value,
    nombre: document.getElementById("nombre").value,
    nom: document.getElementById("nom").value,
  };

  if (indexEdition === null) {
    depenses.push(nouvelleDepense);
  } else {
    depenses[indexEdition] = nouvelleDepense;
    indexEdition = null;
    submitBtn.textContent = "Ajouter";
    submitBtn.classList.replace("btn-primary", "btn-success");
  }

  sauvegarder();
  afficherDepenses();
  form.reset();
  document.getElementById("date").valueAsDate = new Date();
});

searchInput.addEventListener("input", function () {
  const filtre = this.value.toLowerCase();
  const lignes = tableBody.getElementsByTagName("tr");
  let total = 0;
  for (let i = 0; i < lignes.length; i++) {
    const ligne = lignes[i];
    const texte = ligne.textContent.toLowerCase();
    if (texte.includes(filtre)) {
      ligne.style.display = "";
      total += parseInt(ligne.cells[3].textContent) || 0;
    } else {
      ligne.style.display = "none";
    }
  }
  totalPapiers.textContent = total;
});

function exporterPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const data = depenses.map((d) => [
    d.date,
    d.service,
    d.utilisation,
    d.nombre,
    d.nom,
  ]);
  doc.autoTable({
    head: [["Date", "Service", "Utilisation", "Nombre", "Nom"]],
    body: data,
  });
  doc.save("depenses.pdf");
}

function exporterExcel() {
  const ws_data = [
    ["Date", "Service", "Utilisation", "Nombre", "Nom"],
    ...depenses.map((d) => [d.date, d.service, d.utilisation, d.nombre, d.nom]),
  ];
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(ws_data);
  XLSX.utils.book_append_sheet(wb, ws, "Dépenses");
  XLSX.writeFile(wb, "depenses.xlsx");
}

function exporterJSON() {
  const blob = new Blob([JSON.stringify(depenses, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "depenses.json";
  a.click();
  URL.revokeObjectURL(url);
}

afficherDepenses();
