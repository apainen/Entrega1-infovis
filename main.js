//vemos las dimensiones del gráfico 
const margin = { top: 100, right: 250, bottom: 50, left: 100 };
const width = 1500 - margin.left - margin.right;
const height = 700 - margin.top - margin.bottom;

//hacemos el svg
const svg = d3.select("#chart")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

//escala de los ejes
const x = d3.scaleTime().range([0, width]);
const y = d3.scaleLinear().range([height, 0]);

//como segun los datos, los paises usanel un poco mas del 50% de energia aprox por lo que el eje y lo quiero hasta el 55% para sea mas facil de visualizar
const xAxis = d3.axisBottom(x).ticks(10).tickFormat(d3.timeFormat("%Y"));
const yAxis = d3.axisLeft(y).tickValues(d3.range(0, 56, 5));

// colores 
const color = d3.scaleOrdinal()
  .domain([
    'Brazil', 'Colombia', 'Peru', 'Chile', 'Venezuela', 
    'Ecuador', 'Argentina', 'Mexico'
  ])
  .range([
    "#FFD700", // Brazil - amarillo
    "#ff7f0e", // Colombia - naranja
    "#8A2BE2", // Peru - morado
    "#0000FF", // Chile - azul
    "#FF69B4", // Venezuela - rosado
    "#444", // Ecuador - grris
    "#87CEEB ", // Argentina - celeste
    "#A0522D"  // Mexico - café
  ]);

//dataset
d3.csv("01-renewable-share-energy.csv").then(data => {
  data.forEach(d => {
    d.Year = new Date(d.Year, 0, 1);
    d["Renewables (% equivalent primary energy)"] = +d["Renewables (% equivalent primary energy)"];
  });

  //aca filtro los paises de latinoamerica
  const latinAmerica = ['Brazil', 'Colombia','Peru','Chile','Venezuela',
    'Ecuador','Argentina', 'Mexico','Bolivia','Costa Rica',
    'Cuba', 'Dominican Republic',  'El Salvador', 'Guatemala',
    'Honduras',  'Nicaragua', 'Panama', 'Paraguay', 
    'Uruguay'];
  const filteredData = data.filter(d => latinAmerica.includes(d.Entity));

  //datos agrupados
  const nestedData = d3.group(filteredData, d => d.Entity);

  x.domain(d3.extent(data, d => d.Year));
  y.domain([0, 55]);

  //dibujo de los ejes
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(xAxis)
    .append("text")
    .attr("x", width / 2)
    .attr("y", 50)
    .attr("fill", "black")
    .style("text-anchor", "middle")
    .style("font-size", "22px")
    .text("Transcurso de años");
  
  svg.selectAll(".tick text")  // seleccionar las etiquetas de los ticks del eje
    .style("font-size", "16px");

  svg.append("g")
    .call(yAxis)
    .append("text")  // Etiqueta del eje Y
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -50)
    .attr("fill", "black")
    .style("text-anchor", "middle")
    .style("font-size", "22px")
    .text("Porcentaje de Energía Renovable usada");

    const yTicks = y.ticks(); // Obtener los valores de los ticks en el eje Y

  yTicks.forEach(tickValue => {
    svg.append("line")
    .attr("x1", 0) 
    .attr("y1", y(tickValue))
    .attr("x2", width)
    .attr("y2", y(tickValue))
    .attr("stroke", "#666") 
    .attr("stroke-width", 1)
    .attr("stroke-dasharray", "2,2"); // Hacer la línea discontinua (opcional)
});
  
    svg.selectAll(".tick text")  // seleccionar las etiquetas de los ticks del eje
    .style("font-size", "16px");

  // Definir función para dibujar líneas
  const line = d3.line()
    .x(d => x(d.Year))
    .y(d => y(d["Renewables (% equivalent primary energy)"]));

  //lineas para cada pais
  nestedData.forEach((values, key) => {
    svg.append("path")
      .datum(values)
      .attr("fill", "none")
      .attr("stroke", color(key))  //color unico para cada pais
      .attr("stroke-width", 3)
      .attr("d", line)
      //.on("mouseover", function () {  // si bien es estatico al pasar el mousse se resalta la linea de cada pais, preguntar si sirve o podemos hacer 
      //eso aunque segun yo no cambia la visualizacion de mas
        //d3.select(this).attr("stroke-width", 4);
      //})
      //.on("mouseout", function () {
        //d3.select(this).attr("stroke-width", 2);

        const filteredPoints = values.filter(d => d.Year.getFullYear() % 5 === 0);

    //puntos sobre lineas 
    svg.selectAll(`.point-${key}`)
      .data(filteredPoints)
      .enter()
      .append("circle")
      .attr("class", `point-${key}`)
      .attr("cx", d => x(d.Year))
      .attr("cy", d => y(d["Renewables (% equivalent primary energy)"]))
      .attr("r", 4)  // Tamaño fijo de los puntos
      .attr("fill", color(key));
  });
  const customOrder = [
    'Brazil', 'Colombia', 'Peru', 'Chile', 'Venezuela',
    'Ecuador', 'Argentina', 'Mexico'
  ];
    // leyenda de los países con orden personalizado
    const legend = svg.selectAll(".legend")
    .data(customOrder)
    .enter().append("g")
    .attr("class", "legend")
    .attr("transform", (d, i) => `translate(0, ${i * 30})`);

    // rectángulos de colores para cada país en la leyenda
    legend.append("rect")
    .attr("x", width + 50)
    .attr("width", 25)
    .attr("height", 25)
    .style("fill", d => color(d));

    // texto de la leyenda para cada país
    legend.append("text")
    .attr("x", width + 80)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "start")
    .style("font-size", "20px")
    .text(d => d);
});
