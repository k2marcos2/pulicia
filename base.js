document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('checklist-form');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = {};

    // Agrupa múltiplos checkboxes
    formData.forEach((value, key) => {
      if (data[key]) {
        data[key] += `, ${value}`;
      } else {
        data[key] = value;
      }
    });

    try {
      const response = await fetch("https://script.google.com/macros/s/AKfycbyGtwQAQrg2lnVVT2QMf6DkYG_ieFtezoaO1zuWQwiPr2HtueH8AQn0zquJIUYrvOPF-w/exec", {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      alert("Formulário enviado com sucesso!");
      form.reset();
    } catch (error) {
      console.error("Erro ao enviar:", error);
      alert("Erro ao enviar o formulário.");
    }
  });
});
