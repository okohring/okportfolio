  function draw() {
    const w = window.innerWidth, h = window.innerHeight;
    ctx.clearRect(0, 0, w, h);
    drawOcean(w, h);
    ctx.save();
    ctx.translate(-camera.x, -camera.y);
    drawWorldBase();
    drawPaths();
    drawZones();
    drawProps();
    drawActors();
    ctx.restore();
    drawVignette(w, h);
  }

  function drawOcean(w, h) {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, '#2f7190');
    g.addColorStop(0.55, '#23617c');
    g.addColorStop(1, '#1d455f');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.globalAlpha = 0.16;
    ctx.strokeStyle = '#d8f5ff';
    ctx.lineWidth = 2;
    for (let i = -200; i < w + 240; i += 110) {
      ctx.beginPath();
      for (let x = i; x < i + 150; x += 12) {
        const y = h - 80 + Math.sin((x + performance.now() * 0.02) * 0.04) * 5;
        if (x === i) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawWorldBase() {
    const island = new Path2D();
    island.moveTo(280, 255);
    island.bezierCurveTo(560, 40, 1010, 65, 1320, 105);
    island.bezierCurveTo(1660, 70, 2060, 125, 2170, 500);
    island.bezierCurveTo(2280, 870, 2050, 1330, 1600, 1430);
    island.bezierCurveTo(1080, 1588, 510, 1440, 235, 1210);
    island.bezierCurveTo(20, 1035, 75, 600, 280, 255);
    island.closePath();

    ctx.fillStyle = '#e9c482';
    ctx.fill(island);
    ctx.save();
    ctx.clip(island);

    const grass = ctx.createRadialGradient(1120, 750, 50, 1120, 750, 1100);
    grass.addColorStop(0, '#9ebf70');
    grass.addColorStop(0.55, '#83aa66');
    grass.addColorStop(1, '#5f8958');
    ctx.fillStyle = grass;
    ctx.fillRect(0, 0, world.width, world.height);

    ctx.fillStyle = '#efc98d';
    blob(250, 1100, 360, 200, 0.15);
    blob(1770, 1210, 410, 210, -0.22);
    blob(1690, 330, 310, 160, 0.45);
    blob(410, 500, 370, 170, -0.18);

    ctx.strokeStyle = 'rgba(208, 154, 93, 0.45)';
    ctx.lineWidth = 54;
    ctx.lineCap = 'round';
    for (const [a, b] of paths) {
      const za = getZone(a), zb = getZone(b);
      ctx.beginPath();
      ctx.moveTo(za.x, za.y);
      const mx = (za.x + zb.x) / 2 + Math.sin(za.x + zb.y) * 45;
      const my = (za.y + zb.y) / 2 + Math.cos(za.y + zb.x) * 35;
      ctx.quadraticCurveTo(mx, my, zb.x, zb.y);
      ctx.stroke();
    }

    ctx.restore();
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,.45)';
    ctx.lineWidth = 12;
    ctx.setLineDash([34, 24]);
    ctx.stroke(island);
    ctx.restore();
  }

  function drawPaths() {
    ctx.save();
    ctx.strokeStyle = 'rgba(248, 217, 160, 0.33)';
    ctx.lineWidth = 18;
    ctx.lineCap = 'round';
    for (const [a, b] of paths) {
      const za = getZone(a), zb = getZone(b);
      ctx.beginPath();
      ctx.moveTo(za.x, za.y);
      const mx = (za.x + zb.x) / 2 + Math.sin(za.x + zb.y) * 45;
      const my = (za.y + zb.y) / 2 + Math.cos(za.y + zb.x) * 35;
      ctx.quadraticCurveTo(mx, my, zb.x, zb.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawZones() {
    for (const z of zones) {
      ctx.save();
      ctx.translate(z.x, z.y);
      ctx.fillStyle = z.color;
      ctx.strokeStyle = z.id === player.zoneId ? 'rgba(255, 228, 160, .9)' : 'rgba(255,255,255,.11)';
      ctx.lineWidth = z.id === player.zoneId ? 4 : 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, z.r * 1.1, z.r * 0.68, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = 'rgba(45,34,25,.78)';
      roundRect(-86, z.r * 0.42, 172, 34, 17);
      ctx.fill();
      ctx.fillStyle = '#fff2d4';
      ctx.font = '700 15px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(z.name, 0, z.r * 0.42 + 17);
      ctx.restore();
    }
  }

  function drawProps() {
    const treeSpots = [
      [260,280,10], [440,260,12], [610,180,9], [850,170,8], [1540,210,10], [1800,205,12], [2030,430,10],
      [220,610,7], [490,660,7], [1960,620,8], [430,1340,9], [820,1370,7], [1540,1380,8]
    ];
    for (const [x,y,n] of treeSpots) {
      for (let i = 0; i < n; i++) {
        drawTree(x + randSeed(i * 19 + x) * 150 - 75, y + randSeed(i * 31 + y) * 110 - 55, 34 + randSeed(i * 7) * 18);
      }
    }

    drawTents(735, 555);
    drawCampfire(1120, 760);
    drawWorkshop(1160, 420);
    drawWell(1420, 645);
    drawDock(1785, 1100);
    drawLookout(1870, 330);
    drawGrove(520, 215);
    drawTribeMat(1260, 1140);
    drawCove(375, 1080);

    for (let i = 0; i < 140; i++) {
      const x = 190 + randSeed(i * 73) * 1900;
      const y = 180 + randSeed(i * 41) * 1220;
      if (i % 3 === 0) drawFlower(x, y, i);
      else if (i % 5 === 0) drawRock(x, y, 5 + randSeed(i) * 10);
    }
  }

