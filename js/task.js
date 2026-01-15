const interpretations = {
  presence_of_wave_sin: {
    title: "Sine Wave",
    desc: "When a sine wave is used as a carrier, lower anxiety levels are induced. This pure waveform lacks harmonics, resulting in a low spectral density that reduces perceived sensory tension.",
    legend: "1 sin wave:",
    audio: "media/audio/SON10.wav",
  },
  oscillator1_release: {
    title: "Release Time",
    desc: "No significant effect on anxiety was detected for the release time. Shorter realease time (a quicker sound cutoff) isn't significantly more violent than longer fade-outs.",
    legend: "Short relase:",
    audio: "media/audio/SON107.wav",
  },
  presence_of_wave_triangle: {
    title: "Triangle Wave",
    desc: "No significant effect on anxiety was detected for the triangle wave. Its balanced harmonic structure does not appear to significantly shift the emotional perception in this model.",
    legend: "1 triangle wave:",
    audio: "media/audio/SON235.wav",
  },
  oscillator1_decay: {
    title: "Decay Time",
    desc: "No significant effect on anxiety was detected for the decay time. The duration of the volume drop after the attack phase does not significantly influence the anxiety score here.",
    legend: "Long decay:",
    audio: "media/audio/SON110.wav",
  },
  oscillator1_attack: {
    title: "Attack Time",
    desc: "No significant effect on anxiety was detected for the attack time. With a longer attack, a sound progressively intensifies, which can be as oppressful as a brutal loud noise, often linked to startle reflexes.",
    legend: "Long attack:",
    audio: "media/audio/SON185.wav",
  },
  presence_of_wave_saw: {
    title: "Sawtooth Wave",
    desc: "No significant effect on anxiety was detected for the sawtooth wave. Although rich in harmonics, its presence alone is not a reliable predictor of induced anxiety in this context.",
    legend: "3 saw waves modulate each other:",
    audio: "media/audio/SON169.wav",
  },
  nb_osc_fine_not_zero: {
    title: "Detune (Fine Tuning)",
    desc: "When oscillators are detuned from one another, higher anxiety is induced. The resulting frequency interference creates 'beating' effects and sensory roughness, signals associated with acoustic instability.",
    legend: "Detuning:",
    audio: "media/audio/SON126.wav",
  },
  osc1_coarse: {
    title: "Pitch (Coarse Tuning)",
    desc: "When the coarse tuning is increased, higher anxiety is induced. High-frequency fundamental tones align with the human ear's maximum sensitivity range, often associated with biological alarm signals like screams.",
    legend: "High frequency:",
    audio: "media/audio/SON135.wav",
  },
  presence_of_wave_square: {
    title: "Square Wave",
    desc: "When a square wave is present, higher anxiety is induced. Its rich odd-harmonic structure produces a sharp, aggressive timbre that increases the cognitive load required for auditory processing.",
    legend: "1 square wave modulated by another:",
    audio: "media/audio/SON81.wav",
  },
  oscillator1_sustain: {
    title: "Sustain Level",
    desc: "When the sustain level is increased, higher anxiety is induced. A sound that maintains maximum volume without decay creates a constant saturation of the auditory field, perceived as more oppressive.",
    legend: "Long sustain:",
    audio: "media/audio/SON86.wav",
  },
  nb_osc_act: {
    title: "Oscillators Number",
    desc: "When the number of active oscillators increases, higher anxiety is induced. A higher count of operators in FM synthesis leads to greater spectral complexity and a denser, more overwhelming soundscape.",
    legend: "4 active oscillators:",
    audio: "media/audio/SON140.wav",
  },
};

function updateDetails(d) {
  const info = interpretations[d.Variable] || {
    title: d.Variable,
    desc: "Detailed analysis not available for this parameter.",
    legend: "Audio example:",
    audio: "",
  };

  d3.select("#detail-default").style("display", "none");
  d3.select("#detail-content").style("display", "block");

  d3.select("#det-title").text(info.title);
  d3.select("#det-coef").text(d.Coefficient.toFixed(3));
  d3.select("#det-p").text(
    d.p_value < 0.001 ? "< 0.001" : d.p_value.toFixed(3)
  );
  d3.select("#det-desc").text(info.desc);
  d3.select("#det-audio-legend").text(info.legend);

  const player = document.getElementById("det-audio-player");
  if (player && info.audio) {
    player.src = info.audio;
    player.load();
  }
}

async function drawRegressionChart() {
  const chartDiv = document.getElementById("regression-chart");
  if (!chartDiv) return;

  try {
    const data = await d3.csv("csv/coefficients_regression.csv");
    data.forEach((d) => {
      d.Coefficient = +d.Coefficient;
      d.CI_lower = +d.CI_lower;
      d.CI_upper = +d.CI_upper;
      d.p_value = +d.p_value;
    });

    data.sort((a, b) => b.Coefficient - a.Coefficient);

    const containerWidth = chartDiv.clientWidth;
    const margin = { top: 60, right: 40, bottom: 80, left: 280 };
    const width = containerWidth - margin.left - margin.right;
    const height = 700 - margin.top - margin.bottom;

    d3.select("#regression-chart").html("");

    const svg = d3
      .select("#regression-chart")
      .append("svg")
      .attr("viewBox", `0 0 ${containerWidth} 700`)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleLinear()
      .domain([
        d3.min(data, (d) => d.CI_lower) - 0.2,
        d3.max(data, (d) => d.CI_upper) + 0.2,
      ])
      .range([0, width]);

    const y = d3
      .scaleBand()
      .domain(data.map((d) => d.Variable))
      .range([0, height])
      .padding(0.6);

    svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(5))
      .selectAll("text")
      .style("font-size", "1rem")
      .style("font-family", "'OCR A Std', monospace")
      .style("fill", "#eadde4");

    svg
      .append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(y).tickFormat((d) => interpretations[d]?.title || d))
      .selectAll("text")
      .style("font-size", "1rem")
      .style("font-family", "'OCR A Std', monospace")
      .style("fill", "#eadde4");
    svg
      .append("text")
      .attr("class", "chart-main-title")
      .attr("x", width / 2 - 100)
      .attr("y", -30)
      .attr("text-anchor", "middle")
      .attr("fill", "#ac86ef")
      .style("font-size", "1.6rem")
      .style("font-family", "'OCR A Std', monospace")
      .style("font-weight", "600")
      .text("Regression Coefficients : Anxiety Drivers");
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height + 60)
      .attr("text-anchor", "middle")
      .attr("fill", "#ac86ef")
      .style("font-size", "1.1rem")
      .style("font-family", "'OCR A Std', monospace")
      .text("Coefficient Value");

    svg
      .append("line")
      .attr("x1", x(0))
      .attr("x2", x(0))
      .attr("y1", 0)
      .attr("y2", height)
      .attr("stroke", "rgba(234, 221, 228, 0.2)")
      .attr("stroke-dasharray", "4");

    const rows = svg
      .selectAll(".row-group")
      .data(data)
      .enter()
      .append("g")
      .attr("class", "row-group")
      .style("cursor", "pointer")
      .on("mouseover", function (event, d) {
        d3.select(this)
          .select(".error-line")
          .transition()
          .duration(200)
          .style("stroke-width", "10px");
        d3.select(this)
          .select(".coef-dot")
          .transition()
          .duration(200)
          .attr("r", 12);
        updateDetails(d);
      })
      .on("mouseout", function () {
        d3.select(this)
          .select(".error-line")
          .transition()
          .duration(200)
          .style("stroke-width", "4px");
        d3.select(this)
          .select(".coef-dot")
          .transition()
          .duration(200)
          .attr("r", 8);
      });

    rows
      .append("line")
      .attr("class", "error-line")
      .attr("x1", (d) => x(d.CI_lower))
      .attr("x2", (d) => x(d.CI_upper))
      .attr("y1", (d) => y(d.Variable) + y.bandwidth() / 2)
      .attr("y2", (d) => y(d.Variable) + y.bandwidth() / 2)
      .attr("stroke", (d) =>
        d.p_value < 0.05
          ? d.Coefficient > 0
            ? "#065728ff"
            : "#3d0106ff"
          : "#555"
      )
      .style("stroke-width", "4px");

    rows
      .append("circle")
      .attr("class", "coef-dot")
      .attr("cx", (d) => x(d.Coefficient))
      .attr("cy", (d) => y(d.Variable) + y.bandwidth() / 2)
      .attr("r", 8)
      .attr("fill", (d) =>
        d.p_value < 0.05
          ? d.Coefficient > 0
            ? "#065728ff"
            : "#3d0106ff"
          : "#bdc3c7"
      );
  } catch (error) {
    console.error("Error loading regression chart:", error);
  }
}

window.addEventListener("load", () => {
  drawRegressionChart();
  window.addEventListener("resize", drawRegressionChart);
});

// ============================================================================
// NEURAL NETWORK SCATTER PLOT
// ============================================================================

async function drawNNChart() {
  const chartDiv = document.getElementById("nn-chart");
  if (!chartDiv) return;

  try {
    const data = await d3.csv("csv/nn_predictions_test.csv");
    data.forEach((d) => {
      d.actual_anxiety = +d.actual_anxiety;
      d.predicted_anxiety = +d.predicted_anxiety;
      d.absolute_error = +d.absolute_error;
    });

    const containerWidth = chartDiv.clientWidth;
    const margin = { top: 60, right: 40, bottom: 80, left: 80 };
    const width = containerWidth - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    d3.select("#nn-chart").html("");

    const svg = d3
      .select("#nn-chart")
      .append("svg")
      .attr("viewBox", `0 0 ${containerWidth} 600`)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear().domain([0, 100]).range([0, width]);
    const y = d3.scaleLinear().domain([0, 100]).range([height, 0]);

    // Grid
    svg
      .append("g")
      .attr("class", "grid")
      .attr("opacity", 0.1)
      .call(d3.axisLeft(y).tickSize(-width).tickFormat(""));

    svg
      .append("g")
      .attr("class", "grid")
      .attr("opacity", 0.1)
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickSize(-height).tickFormat(""));

    // Axes
    svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(10))
      .selectAll("text")
      .style("font-size", "1rem")
      .style("font-family", "'OCR A Std', monospace")
      .style("fill", "#eadde4");

    svg
      .append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(y).ticks(10))
      .selectAll("text")
      .style("font-size", "1rem")
      .style("font-family", "'OCR A Std', monospace")
      .style("fill", "#eadde4");

    // Title
    svg
      .append("text")
      .attr("class", "chart-main-title")
      .attr("x", width / 2)
      .attr("y", -30)
      .attr("text-anchor", "middle")
      .attr("fill", "#ac86ef")
      .style("font-size", "1.6rem")
      .style("font-family", "'OCR A Std', monospace")
      .style("font-weight", "600")
      .text("Neural Network Predictions vs Actual Scores");

    // Axis labels
    svg
      .append("text")
      .attr("class", "axis-label")
      .attr("x", width / 2)
      .attr("y", height + 60)
      .attr("text-anchor", "middle")
      .attr("fill", "#ac86ef")
      .style("font-size", "1.2rem")
      .style("font-family", "'OCR A Std', monospace")
      .text("Actual Anxiety Score");

    svg
      .append("text")
      .attr("class", "axis-label")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -60)
      .attr("text-anchor", "middle")
      .attr("fill", "#ac86ef")
      .style("font-size", "1.2rem")
      .style("font-family", "'OCR A Std', monospace")
      .text("Predicted Anxiety Score");

    // Perfect prediction line
    svg
      .append("line")
      .attr("x1", x(0))
      .attr("x2", x(100))
      .attr("y1", y(0))
      .attr("y2", y(100))
      .attr("stroke", "#ac86ef")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5")
      .attr("opacity", 0.5);

    svg
      .append("text")
      .attr("x", x(90))
      .attr("y", y(95))
      .attr("fill", "#ac86ef")
      .style("font-size", "0.9rem")
      .style("font-family", "'OCR A Std', monospace")
      .text("Perfect prediction");

    // Data points
    svg
      .selectAll(".nn-dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "nn-dot")
      .attr("cx", (d) => x(d.actual_anxiety))
      .attr("cy", (d) => y(d.predicted_anxiety))
      .attr("r", 6)
      .attr("fill", "#540da6")
      .attr("stroke", "#ac86ef")
      .attr("stroke-width", 1.5)
      .attr("opacity", 0.7)
      .style("cursor", "pointer")
      .on("mouseover", function () {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", 10)
          .attr("opacity", 1);
      })
      .on("mouseout", function () {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", 6)
          .attr("opacity", 0.7);
      })
      .on("click", function (event, d) {
        updateNNDetails(d);
      });
  } catch (error) {
    console.error("Error loading neural network chart:", error);
  }
}

function updateNNDetails(d) {
  d3.select("#nn-detail-default").style("display", "none");
  d3.select("#nn-detail-content").style("display", "block");

  d3.select("#nn-sound-id").text(d.sound_id);
  d3.select("#nn-actual").text(d.actual_anxiety.toFixed(1));
  d3.select("#nn-predicted").text(d.predicted_anxiety.toFixed(1));
  d3.select("#nn-error").text(d.absolute_error.toFixed(1));

  // Convert SON_1 -> SON1 for audio path
  const soundFileName = d.sound_id.replace("_", "");
  const audioPath = `media/audio/${soundFileName}.wav`;

  // Play sound directly on click
  const audio = new Audio(audioPath);
  audio.play().catch((err) => {
    console.error("Error playing audio:", err);
  });

  // Also update the audio player element
  const player = document.getElementById("nn-audio-player");
  if (player) {
    player.src = audioPath;
    player.load();
  }
}

// Initialize NN chart on load
window.addEventListener("load", () => {
  drawRegressionChart();
  drawNNChart();
  window.addEventListener("resize", () => {
    drawRegressionChart();
    drawNNChart();
  });
});
