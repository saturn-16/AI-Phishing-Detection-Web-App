btn.onclick = async () => {
  const url = urlInput.value.trim();
  if (!url) {
    alert('Please enter a URL');
    return;
  }

  // Remove 'visible' class to reset animation
  resultBox.classList.remove('visible');

  // Force reflow to reset animation (important!)
  void resultBox.offsetWidth;

  typeText(resultBox, "Checking...");

  try {
    const res = await fetch('http://localhost:5000/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    if (!res.ok) throw new Error('Network response not ok');

    const data = await res.json();

    // Update the result content
    resultBox.innerHTML = `
      <div><strong>Prediction:</strong> ${data.prediction === 0 ? '✅ Safe' : '⚠️ Phishing'}</div>
      <div><strong>Probability:</strong> ${(data.probability * 100).toFixed(1)}%</div>
    `;

    // Add the class back to trigger animation
    resultBox.classList.add('visible');
  } catch (e) {
    resultBox.textContent = "Error connecting to backend";
    resultBox.classList.add('visible');
    console.error(e);
  }
};
