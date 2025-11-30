export function sleep(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export function isNullish<T>(value: T) {
  return value === null || value === undefined;
}

export function getInitialsName(fullName?: string | null): string {
  if (!fullName) {
    return '';
  }

  const nameParts = fullName.trim().split(/\s+/).filter(p => p.length > 0);

  if (nameParts.length === 0) {
    return '';
  }

  const firstInitial = nameParts[0].charAt(0).toUpperCase();

  if (nameParts.length === 1) {
    return firstInitial;
  }

  const lastInitial = nameParts[nameParts.length - 1].charAt(0).toUpperCase();

  return firstInitial + lastInitial;
}
