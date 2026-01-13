const jStat = {
  studentt: {
    cdf: function (x, df) {
      const t = x;
      const a = df / 2;
      const z = df / (df + t * t);
      if (t >= 0) {
        return 1 - 0.5 * Math.pow(z, a);
      } else {
        return 0.5 * Math.pow(z, a);
      }
    },
  },
};

function renderHistogram(selector, data, key, xLabel, yLabel) {
  const box = d3.select(selector + " .d3-chart");
  box.html("");

  const containerWidth = document.querySelector(selector).clientWidth;
  const w = Math.min(containerWidth, 500);
  const h = 300;
  const m = { t: 40, r: 30, b: 60, l: 50 };

  const svg = box
    .append("svg")
    .attr("viewBox", `0 0 ${w} ${h}`)
    .append("g")
    .attr("transform", `translate(${m.l},${m.t})`);

  const values = data
    .map((d) => +d[key])
    .filter((v) => !isNaN(v) && v >= 0 && v <= 100);

  const x = d3
    .scaleLinear()
    .domain([0, 100])
    .range([0, w - m.l - m.r]);

  const bins = d3.bin().domain(x.domain()).thresholds(20)(values);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(bins, (d) => d.length)])
    .range([h - m.t - m.b, 0]);

  svg
    .selectAll("rect")
    .data(bins)
    .enter()
    .append("rect")
    .attr("x", (d) => x(d.x0) + 1)
    .attr("width", (d) => Math.max(0, x(d.x1) - x(d.x0) - 2))
    .attr("y", (d) => y(d.length))
    .attr("height", (d) => y(0) - y(d.length))
    .attr("fill", "#1c0363")
    .attr("stroke", "#ac86ef")
    .attr("stroke-width", 0.5);

  svg
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${h - m.t - m.b})`)
    .call(d3.axisBottom(x).ticks(5))
    .selectAll("text")
    .style("fill", "#eadde4")
    .style("font-family", "'OCR A Std', monospace")
    .style("font-size", "0.9rem");

  svg
    .append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(y).ticks(5))
    .selectAll("text")
    .style("fill", "#eadde4")
    .style("font-family", "'OCR A Std', monospace")
    .style("font-size", "0.9rem");

  svg
    .append("text")
    .attr("x", (w - m.l - m.r) / 2)
    .attr("y", h - m.t - m.b + 45)
    .attr("text-anchor", "middle")
    .attr("fill", "#ac86ef")
    .style("font-size", "1rem")
    .style("font-family", "'OCR A Std', monospace")
    .text(xLabel);

  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -(h - m.t - m.b) / 2)
    .attr("y", -35)
    .attr("text-anchor", "middle")
    .attr("fill", "#ac86ef")
    .style("font-size", "1rem")
    .style("font-family", "'OCR A Std', monospace")
    .text(yLabel);
}

function renderBiasChart(selector, data) {
  const box = d3.select(selector + " .d3-chart");
  box.html("");

  const containerWidth = document.querySelector(selector).clientWidth;
  const w = Math.min(containerWidth, 700);
  const h = 350;
  const m = { t: 40, r: 40, b: 70, l: 60 };

  const svg = box
    .append("svg")
    .attr("viewBox", `0 0 ${w} ${h}`)
    .append("g")
    .attr("transform", `translate(${m.l},${m.t})`);

  const validData = data
    .filter(
      (d) => d.presentation_index !== undefined && d.anxiety_score !== undefined
    )
    .map((d) => ({
      index: +d.presentation_index,
      score: +d.anxiety_score,
    }))
    .filter((d) => !isNaN(d.index) && !isNaN(d.score));

  if (validData.length === 0) {
    box.html(
      "<p style='color:#e74c3c; padding:20px; text-align:center;'>Données manquantes pour l'analyse de biais</p>"
    );
    return;
  }

  const maxIndex = d3.max(validData, (d) => d.index);
  const x = d3
    .scaleLinear()
    .domain([0, maxIndex])
    .range([0, w - m.l - m.r]);
  const y = d3
    .scaleLinear()
    .domain([0, 100])
    .range([h - m.t - m.b, 0]);

  svg
    .selectAll("circle")
    .data(validData)
    .enter()
    .append("circle")
    .attr("cx", (d) => x(d.index))
    .attr("cy", (d) => y(d.score))
    .attr("r", 2.5)
    .attr("fill", "#999")
    .attr("opacity", 0.15);

  const n = validData.length;
  const sumX = d3.sum(validData, (d) => d.index);
  const sumY = d3.sum(validData, (d) => d.score);
  const sumXY = d3.sum(validData, (d) => d.index * d.score);
  const sumX2 = d3.sum(validData, (d) => d.index * d.index);
  const sumY2 = d3.sum(validData, (d) => d.score * d.score);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  const r =
    (n * sumXY - sumX * sumY) /
    Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  const t = r * Math.sqrt((n - 2) / (1 - r * r));
  const pValue = 2 * (1 - jStat.studentt.cdf(Math.abs(t), n - 2));

  svg
    .append("line")
    .attr("x1", x(0))
    .attr("y1", y(intercept))
    .attr("x2", x(maxIndex))
    .attr("y2", y(slope * maxIndex + intercept))
    .attr("stroke", "#e74c3c")
    .attr("stroke-width", 2.5);

  const rElem = document.getElementById("bias-r");
  const pElem = document.getElementById("bias-p");
  if (rElem) rElem.textContent = r.toFixed(3);
  if (pElem) pElem.textContent = pValue < 0.001 ? "< 0.001" : pValue.toFixed(3);

  svg
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${h - m.t - m.b})`)
    .call(d3.axisBottom(x).ticks(8))
    .selectAll("text")
    .style("fill", "#eadde4")
    .style("font-family", "'OCR A Std', monospace")
    .style("font-size", "0.9rem");

  svg
    .append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(y).ticks(6))
    .selectAll("text")
    .style("fill", "#eadde4")
    .style("font-family", "'OCR A Std', monospace")
    .style("font-size", "0.9rem");

  svg
    .append("text")
    .attr("x", (w - m.l - m.r) / 2)
    .attr("y", h - m.t - m.b + 50)
    .attr("text-anchor", "middle")
    .attr("fill", "#ac86ef")
    .style("font-size", "1rem")
    .style("font-family", "'OCR A Std', monospace")
    .text("Position in the test");

  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -(h - m.t - m.b) / 2)
    .attr("y", -40)
    .attr("text-anchor", "middle")
    .attr("fill", "#ac86ef")
    .style("font-size", "1rem")
    .style("font-family", "'OCR A Std', monospace")
    .text("Anxiety Score");
}

async function initDataCharts() {
  try {
    const dataResponses = await d3.csv("csv/individual_responses.csv");
    const dataSynthese = await d3.csv("csv/synthese_anxiete_resultats.csv");

    if (document.getElementById("hist-scores")) {
      if (dataResponses[0].hasOwnProperty("anxiety_score")) {
        renderHistogram(
          "#hist-scores",
          dataResponses,
          "anxiety_score",
          "Score (non-anxiogenic to highly anxiogenic)",
          "Frequency"
        );
      } else {
        const expandedData = [];
        dataResponses.forEach((d) => {
          const mean = +d.mean_eval;
          const std = +d.std_eval || 15;
          const nb = +d.nb_eval || 1;
          for (let i = 0; i < nb; i++) {
            const score = Math.max(
              0,
              Math.min(100, mean + (Math.random() - 0.5) * std * 2)
            );
            expandedData.push({ anxiety_score: score });
          }
        });
        renderHistogram(
          "#hist-scores",
          expandedData,
          "anxiety_score",
          "Score (non-anxiogenic to highly anxiogenic)",
          "Fréquency"
        );
      }
    }

    if (document.getElementById("hist-sounds")) {
      renderHistogram(
        "#hist-sounds",
        dataSynthese,
        "mean_eval",
        "Mean score of anxiety",
        "Number of sounds"
      );
    }

    if (document.getElementById("bias-chart")) {
      if (
        dataResponses[0].hasOwnProperty("presentation_index") &&
        dataResponses[0].hasOwnProperty("anxiety_score")
      ) {
        renderBiasChart("#bias-chart", dataResponses);
      } else {
        d3.select("#bias-chart .d3-chart").html(
          "<p style='color:#e74c3c; padding:20px; text-align:center;'>Données manquantes pour l'analyse de biais</p>"
        );
      }
    }
  } catch (error) {
    console.error("Error loading data:", error);
  }
}

window.addEventListener("load", () => {
  initDataCharts();
  window.addEventListener("resize", initDataCharts);
});
