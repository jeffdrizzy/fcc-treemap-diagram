const DATA_URL =
  'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json';

const w = 960;
const h = 570;

const tooltip = d3.select('#tooltip');

fetch(DATA_URL)
  .then((res) => res.json())
  .then((data) => {
    const svg = d3
      .select('#chart')
      .append('svg')
      .attr('width', w)
      .attr('height', h);

    const root = d3
      .hierarchy(data)
      .sum((d) => d.value)
      .sort((a, b) => b.value - a.value);

    d3.treemap().size([w, h]).paddingInner(1)(root);

    const categories = root.children.map((d) => d.data.name);
    const colorScale = d3.scaleOrdinal().domain(categories).range(d3.schemeCategory10);

    const leaves = root.leaves();

    const tile = svg
      .selectAll('g')
      .data(leaves)
      .enter()
      .append('g')
      .attr('transform', (d) => 'translate(' + d.x0 + ',' + d.y0 + ')');

    tile
      .append('rect')
      .attr('class', 'tile')
      .attr('data-name', (d) => d.data.name)
      .attr('data-category', (d) => d.data.category)
      .attr('data-value', (d) => d.data.value)
      .attr('width', (d) => d.x1 - d.x0)
      .attr('height', (d) => d.y1 - d.y0)
      .attr('fill', (d) => colorScale(d.data.category))
      .on('mouseover', (event, d) => {
        tooltip
          .style('opacity', 0.9)
          .attr('data-value', d.data.value)
          .html(
            'Name: ' +
              d.data.name +
              '<br>Category: ' +
              d.data.category +
              '<br>Value: ' +
              d.data.value
          )
          .style('left', event.pageX + 10 + 'px')
          .style('top', event.pageY - 28 + 'px');
      })
      .on('mouseout', () => {
        tooltip.style('opacity', 0);
      });

    tile
      .append('text')
      .selectAll('tspan')
      .data((d) => d.data.name.split(/(?=[A-Z][^A-Z])/g))
      .enter()
      .append('tspan')
      .attr('x', 4)
      .attr('y', (d, i) => 13 + i * 10)
      .text((d) => d);

    // Legend
    const legend = svg
      .append('g')
      .attr('id', 'legend')
      .attr('transform', 'translate(' + (w / 2 - 160) + ',' + (h + 10) + ')');

    // Legend is drawn in a separate svg below the treemap so it does not
    // overlap the tiles.
    d3.select('#chart svg').attr('height', h + 60);

    categories.forEach((category, i) => {
      const g = legend
        .append('g')
        .attr('transform', 'translate(' + (i % 4) * 160 + ',' + Math.floor(i / 4) * 25 + ')');
      g.append('rect')
        .attr('class', 'legend-item')
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', colorScale(category));
      g.append('text').attr('x', 20).attr('y', 12).text(category);
    });
  })
  .catch((err) => console.error('Failed to load movie data:', err));
