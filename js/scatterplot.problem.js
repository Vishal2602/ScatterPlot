function scatter_plot(data, ax, title = "", xCol = "", yCol = "", rCol = "", legend = [], colorCol = "", margin = 50) {
    const xScale = d3.scaleLinear()
        .domain(d3.extent(data, d => +d[xCol]))
        .range([margin, 1000 - margin]);

    const yScale = d3.scaleLinear()
        .domain(d3.extent(data, d => +d[yCol]))
        .range([1000 - margin, margin]);

    const rScale = d3.scaleSqrt()
        .domain(d3.extent(data, d => +d[rCol]))
        .range([4, 12]);

    const colorScale = d3.scaleOrdinal()
        .domain([...new Set(data.map(d => d[colorCol]))])
        .range(d3.schemeTableau10);

    const svg = d3.select(ax);

    const circles = svg.selectAll("circle")
        .data(data)
        .join("circle")
        .attr("cx", d => xScale(d[xCol]))
        .attr("cy", d => yScale(d[yCol]))
        .attr("r", d => rScale(d[rCol]))
        .attr("fill", d => colorScale(d[colorCol]))
        .attr("class", d => `scatter-point ${d[colorCol].replace(/\s+/g, '-')}`)
        .attr("id", (d, i) => `id_${i} ${d[colorCol]}`);

    svg.append("g")
        .attr("transform", `translate(0, ${1000 - margin})`)
        .call(d3.axisBottom(xScale).ticks(5));

    svg.append("g")
        .attr("transform", `translate(${margin}, 0)`)
        .call(d3.axisLeft(yScale).ticks(5));

    svg.append("text")
        .attr("x", 500)
        .attr("y", margin / 2)
        .attr("text-anchor", "middle")
        .text(title)
        .attr("class", "title");

    const brush = d3.brush()
        .extent([[margin, margin], [1000 - margin, 1000 - margin]])
        .on("brush end", brushed);

    svg.append("g").call(brush);

    function brushed(event) {
        const selection = event.selection;
        if (!selection) {
            d3.selectAll("circle").classed("selected", false);
            return;
        }
        const [[x0, y0], [x1, y1]] = selection;

        d3.selectAll("circle").classed("selected", d => {
            const x = xScale(d[xCol]);
            const y = yScale(d[yCol]);
            return x0 <= x && x <= x1 && y0 <= y && y <= y1;
        });
    }

    const legendContainer = svg.append("g")
        .attr("transform", `translate(${800},${margin})`);

    const legendItems = legendContainer.selectAll("legend")
        .data([...new Set(data.map(d => d[colorCol]))])
        .join("g")
        .attr("transform", (d, i) => `translate(0, ${i * 25})`)
        .on("click", function (event, country) {
            const isActive = d3.select(this).classed("legendSelect");
            d3.select(this).classed("legendSelect", !isActive);

            svg.selectAll(`.${country.replace(/\s+/g, '-')}`)
                .style("opacity", isActive ? 1 : 0.1);
        });

    legendItems.append("rect")
        .attr("width", 20)
        .attr("height", 20)
        .attr("fill", d => colorScale(d));

    legendItems.append("text")
        .attr("x", 30)
        .attr("y", 15)
        .text(d => d);
}
