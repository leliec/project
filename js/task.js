const interpretations = {
  presence_of_wave_sin: {
    title: "Sine Wave",
    desc: "When a sine wave is used as a carrier, lower anxiety levels are induced. This pure waveform lacks harmonics, resulting in a low spectral density that reduces perceived sensory tension.",
    legend: "Soothing purity of the sine wave:",
    audio: "media/audio/wave_sin.mp3",
  },
  oscillator1_release: {
    title: "Release Time",
    desc: "No significant effect on anxiety was detected for the release time. While longer decays theoretically smooth sound offsets, the current data does not show a statistically reliable impact.",
    legend: "Sound extinction (Release):",
    audio: "media/audio/release_short.mp3",
  },
  presence_of_wave_triangle: {
    title: "Triangle Wave",
    desc: "No significant effect on anxiety was detected for the triangle wave. Its balanced harmonic structure does not appear to significantly shift the emotional perception in this model.",
    legend: "Triangle wave timbre:",
    audio: "media/audio/wave_triangle.mp3",
  },
  oscillator1_decay: {
    title: "Decay Time",
    desc: "No significant effect on anxiety was detected for the decay time. The duration of the volume drop after the attack phase does not significantly influence the anxiety score here.",
    legend: "Volume decay phase:",
    audio: "media/audio/decay.mp3",
  },
  oscillator1_attack: {
    title: "Attack Time",
    desc: "No significant effect on anxiety was detected for the attack time. Although fast attacks are often linked to startle reflexes, this specific parameter did not reach statistical significance in this dataset.",
    legend: "Sharpness of the attack:",
    audio: "media/audio/attack_long.mp3",
  },
  presence_of_wave_saw: {
    title: "Sawtooth Wave",
    desc: "No significant effect on anxiety was detected for the sawtooth wave. Although rich in harmonics, its presence alone is not a reliable predictor of induced anxiety in this context.",
    legend: "Sawtooth wave grain:",
    audio: "media/audio/wave_saw.mp3",
  },
  nb_osc_fine_not_zero: {
    title: "Fine Tuning (Detune)",
    desc: "When oscillators are slightly detuned, higher anxiety is induced. The resulting frequency interference creates 'beating' effects and sensory roughness, signals associated with acoustic instability.",
    legend: "Instability via detuning:",
    audio: "media/audio/fine_tuning.mp3",
  },
  osc1_coarse: {
    title: "Coarse Tuning (Pitch)",
    desc: "When the coarse tuning is increased, higher anxiety is induced. High-frequency fundamental tones align with the human ear's maximum sensitivity range, often associated with biological alarm signals.",
    legend: "High frequency (High Coarse):",
    audio: "media/audio/coarse_high.mp3",
  },
  presence_of_wave_square: {
    title: "Square Wave",
    desc: "When a square wave is present, higher anxiety is induced. Its rich odd-harmonic structure produces a sharp, aggressive timbre that increases the cognitive load required for auditory processing.",
    legend: "Aggressive timbre of the square wave:",
    audio: "media/audio/wave_square.mp3",
  },
  oscillator1_sustain: {
    title: "Sustain Level",
    desc: "When the sustain level is increased, higher anxiety is induced. A sound that maintains maximum energy without decay creates a constant saturation of the auditory field, perceived as oppressive.",
    legend: "Constant energy (Sustain max):",
    audio: "media/audio/sustain_max.mp3",
  },
  nb_osc_act: {
    title: "Oscillators Number",
    desc: "When the number of active oscillators increases, higher anxiety is induced. A higher count of operators in FM synthesis leads to greater spectral complexity and a denser, more overwhelming soundscape.",
    legend: "Density of active oscillators:",
    audio: "media/audio/osc_4.mp3",
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
      .attr("x", width / 2)
      .attr("y", -30)
      .attr("text-anchor", "middle")
      .attr("fill", "#ac86ef")
      .style("font-size", "1.6rem")
      .style("font-family", "'OCR A Std', monospace")
      .style("font-weight", "600")
      .text("Regression Plot");
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
            ? "#3d0106ff"
            : "#065728ff"
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
            ? "#3d0106ff"
            : "#065728ff"
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
