document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");

    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        const formData = new FormData(form);
        const data = {};

        formData.forEach((value, key) => {
            if (data[key]) {
                data[key] += `, ${value}`; // Agrupa valores de checkboxes com o mesmo nome
            } else {
                data[key] = value;
            }
        });

        try {
            await fetch("https://script.google.com/macros/s/AKfycbws5SEJCXlXydZbYcxwnzAYjBvJzCYrK4OeBgpmtNKFem8P3WT9im-YBKGk5N3f2CMN_g/exec", {
                method: "POST",
                mode: "no-cors",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            alert("Formulário enviado com sucesso!");
            form.reset();
        } catch (error) {
            console.error("Erro ao enviar:", error);
            alert("Erro ao enviar o formulário.");
        }
    });
});
