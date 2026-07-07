const navToggle = document.querySelector('.nav-toggle');
const mainNav = document.querySelector('.main-nav');
const scanButton = document.getElementById('scan-button');
const resultBody = document.getElementById('result-body');

navToggle?.addEventListener('click', () => {
  mainNav?.classList.toggle('open');
});

const scanData = {
  allergens: ['peanuts', 'dairy', 'gluten', 'hazelnuts', 'whey', 'casein', 'soy', 'egg'],
  explanations: {
    whey: 'Whey is a milk protein, which is unsafe for dairy allergies.',
    casein: 'Casein is a milk-derived protein often hidden in products labeled as natural flavor.',
    hazelnuts: 'Hazelnuts are tree nuts and may cause nut allergy reactions.',
    gluten: 'Gluten appears in ingredients like wheat, barley, or malt extract.',
    peanuts: 'Peanuts are a common allergen and often appear under multiple names.',
  }
};

scanButton?.addEventListener('click', () => {
  const allergyInput = document.getElementById('allergy-input');
  const labelInput = document.getElementById('label-input');
  const allergies = allergyInput?.value.toLowerCase().split(',').map(item => item.trim()).filter(Boolean) || [];
  const text = labelInput?.value.toLowerCase() || '';

  const found = scanData.allergens.filter(ingredient => text.includes(ingredient));
  const matched = found.filter(item => allergies.some(allergy => item.includes(allergy) || allergy.includes(item)));

  resultBody.innerHTML = '';

  if (matched.length > 0) {
    const heading = document.createElement('p');
    heading.innerHTML = `<strong>Detected:</strong> ${matched.length} potential allergen${matched.length > 1 ? 's' : ''}`;
    const list = document.createElement('ul');

    matched.forEach(item => {
      const li = document.createElement('li');
      const explanation = scanData.explanations[item] || 'This ingredient may be unsafe for your profile.';
      li.innerHTML = `<strong>${item}</strong> — ${explanation}`;
      list.appendChild(li);
    });

    const note = document.createElement('p');
    note.className = 'result-note';
    note.textContent = 'This simulated scan highlights allergens and explains hidden label risks in plain language.';

    resultBody.appendChild(heading);
    resultBody.appendChild(list);
    resultBody.appendChild(note);
  } else if (found.length > 0) {
    resultBody.innerHTML = '<p><strong>Detected ingredients, but no direct matches with your profile.</strong> Review labels and allergen statements carefully.</p>';
  } else {
    resultBody.innerHTML = '<p><strong>No allergen matches detected in this sample text.</strong> Always verify labels in real shopping situations.</p>';
  }
});
