document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('checklist-form');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = {};
    const fotoInput = document.getElementById('foto-motorista');
    
    // Agrupa múltiplos checkboxes
    formData.forEach((value, key) => {
      if (data[key]) {
        data[key] += `, ${value}`;
      } else {
        data[key] = value;
      }
    });

    // Se houver foto, converte para base64
    if (fotoInput.files.length > 0) {
      const fotoFile = fotoInput.files[0];
      const fotoBase64 = await toBase64(fotoFile);
      data.FotoBase64 = fotoBase64;
      data.FotoNome = fotoFile.name;
    }

    try {
      const response = await fetch("https://script.google.com/macros/s/AKfycbyzuX35Yv-2UxamjmDhFMunShQWQ3RKsjCif0EqeIW0IeD9aUQ_H6Cp9DoW3Zsxri2BjA/exec", {
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

  // Função para converter arquivo para base64
  function toBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = error => reject(error);
    });
  }
});