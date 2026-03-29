export function parseRangeHeader(rangeHeader: string, sizeInBytes: number) {
  const match = rangeHeader.match(/^bytes=(\d*)-(\d*)$/i);

  if (!match) {
    return null;
  }

  const [, startRaw, endRaw] = match;
  const hasStart = startRaw !== "";
  const hasEnd = endRaw !== "";

  if (!hasStart && !hasEnd) {
    return null;
  }

  let start = hasStart ? Number.parseInt(startRaw, 10) : Number.NaN;
  let end = hasEnd ? Number.parseInt(endRaw, 10) : Number.NaN;

  if (!hasStart) {
    const suffixLength = end;

    if (!Number.isFinite(suffixLength) || suffixLength <= 0) {
      return null;
    }

    start = Math.max(sizeInBytes - suffixLength, 0);
    end = sizeInBytes - 1;
  } else {
    if (!Number.isFinite(start) || start < 0 || start >= sizeInBytes) {
      return null;
    }

    if (!hasEnd || !Number.isFinite(end)) {
      end = sizeInBytes - 1;
    }
  }

  if (end < start) {
    return null;
  }

  end = Math.min(end, sizeInBytes - 1);

  return { start, end };
}
