/* Geometry ported verbatim from the source Demo, retrieved 2026-10-23.
 * Preserve source marks; only the cropped preview positions and sizes are fitted. */
(function(root){'use strict';
const MIN_SIZE=.04;
const contains=(piece,mark)=>piece.page===mark.page&&mark.x>=piece.rect[0]&&mark.x<=piece.rect[0]+piece.rect[2]&&mark.y>=piece.rect[1]&&mark.y<=piece.rect[1]+piece.rect[3];
const geometry={
errorMarkAssignment(mark, candidates) {
      const page = this.pages.find(item => item.index === mark.page);
      const ratio = page?.width > 0 && page?.height > 0 ? page.height / page.width : 1;
      const half = Math.max(MIN_SIZE, mark.size || MIN_SIZE) / 2, cy = mark.y * ratio;
      const pieces = candidates || this.questions.flatMap(question => question.pieces
        .filter(piece => piece.page === mark.page).map(piece => ({ question, piece })));
      const ranked = pieces.map(({ question, piece }) => {
        const [x, y, w, h] = piece.rect, top = y * ratio, bottom = (y + h) * ratio;
        const dx = Math.max(x - mark.x, 0, mark.x - x - w), dy = Math.max(top - cy, 0, cy - bottom);
        return { question, piece, distance: dx * dx + dy * dy,
          centerDistance: (mark.x - x - w / 2) ** 2 + (cy - (top + bottom) / 2) ** 2,
          inside: contains(piece, mark), area: w * h * ratio,
          overlap: Math.max(0, Math.min(mark.x + half, x + w) - Math.max(mark.x - half, x)) *
            Math.max(0, Math.min(cy + half, bottom) - Math.max(cy - half, top)) };
      });
      const stable = (a, b) => String(a.piece.id) < String(b.piece.id) ? -1 : String(a.piece.id) > String(b.piece.id) ? 1 : 0;
      const inside = ranked.filter(item => item.inside);
      const crossed = ranked.filter(item => item.overlap > 0);
      const pool = inside.length ? inside : crossed;
      pool.sort(inside.length
        ? (a, b) => a.centerDistance - b.centerDistance || a.area - b.area || stable(a, b)
        : (a, b) => a.distance - b.distance || b.overlap - a.overlap || a.centerDistance - b.centerDistance || stable(a, b));
      const target = pool[0];
      return target ? { question: target.question, piece: target.piece } : null;
    },fitCropErrorMarks(marks, piece, width, height, contentHeight) {
      const [x, y, w, h] = piece.rect, minimum = Math.max(0, Math.min(12, width, height)), gap = 2;
      const padY = Math.max(0, (height - contentHeight) / 2);
      const previews = marks.filter(mark => mark.page === piece.page)
        .map(mark => ({ mark, rawX: (mark.x - x) / w * width, rawY: padY + (mark.y - y) / h * contentHeight,
          size: Math.max(0, Math.min(Math.max(12, width * mark.size / w), width, height)) }));
      const center = (raw, size, extent) => Math.max(size / 2, Math.min(extent - size / 2, raw));
      const separated = (a, b, sizeA, sizeB) => {
        const directionX = Math.sign(b.rawX - a.rawX), directionY = Math.sign(b.rawY - a.rawY);
        const horizontal = directionX ? directionX * (center(b.rawX, sizeB, width) - center(a.rawX, sizeA, width)) : -Infinity;
        const vertical = directionY ? directionY * (center(b.rawY, sizeB, height) - center(a.rawY, sizeA, height)) : -Infinity;
        return Math.max(horizontal, vertical) - (sizeA + sizeB) / 2 >= gap;
      };
      const ordered = [...previews].sort((a, b) => String(a.mark.id) < String(b.mark.id) ? -1 : String(a.mark.id) > String(b.mark.id) ? 1 : 0);
      for (let i = 0; i < ordered.length; i++) for (let j = i + 1; j < ordered.length; j++) {
        const a = ordered[i], b = ordered[j];
        if (separated(a, b, a.size, b.size)) continue;
        if (!separated(a, b, minimum, minimum)) { a.size = b.size = minimum; continue; }
        let lower = minimum, upper = Math.max(a.size, b.size);
        for (let step = 0; step < 16; step++) {
          const cap = (lower + upper) / 2;
          if (separated(a, b, Math.min(a.size, cap), Math.min(b.size, cap))) lower = cap;
          else upper = cap;
        }
        a.size = Math.min(a.size, lower); b.size = Math.min(b.size, lower);
        // A smaller fitted square stays inside its previous footprint, so
        // resolving later pairs cannot collide with an already resolved pair.
      }
      return previews.map(preview => ({ mark: preview.mark, size: preview.size,
        left: center(preview.rawX, preview.size, width), top: center(preview.rawY, preview.size, height) }));
    },
assignment(mark,pages,boxes){
 const context={pages:pages.map((p,index)=>({index,width:p.w,height:p.h})),questions:boxes.map(b=>({id:b.group||b.id,pieces:[{id:String(b.id),page:b.page,rect:[b.x/pages[b.page].w,b.y/pages[b.page].h,b.w/pages[b.page].w,b.h/pages[b.page].h]}]}))};
 return this.errorMarkAssignment.call(context,mark)?.piece.id||null;
}
};
root.BanxueMarkGeometry=geometry;if(typeof module!=='undefined')module.exports=geometry;
})(typeof window!=='undefined'?window:globalThis);
