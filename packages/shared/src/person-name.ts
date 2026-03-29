export type PersonNameInput = {
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
};

function normalizeNamePart(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function splitFullName(name?: string | null) {
  const normalizedName = normalizeNamePart(name);

  if (!normalizedName) {
    return {
      firstName: null,
      lastName: null,
    };
  }

  const parts = normalizedName.split(/\s+/).filter(Boolean);

  return {
    firstName: parts[0] ?? null,
    lastName: parts.slice(1).join(" ") || null,
  };
}

export function composeFullName(
  firstName?: string | null,
  lastName?: string | null,
) {
  const normalizedFirstName = normalizeNamePart(firstName);
  const normalizedLastName = normalizeNamePart(lastName);
  const fullName = [normalizedFirstName, normalizedLastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || null;
}

export function derivePersonNameFields(input: PersonNameInput) {
  const explicitFirstName = normalizeNamePart(input.firstName);
  const explicitLastName = normalizeNamePart(input.lastName);
  const legacyParts = splitFullName(input.name);
  const firstName = explicitFirstName ?? legacyParts.firstName;
  const lastName = explicitLastName ?? legacyParts.lastName;

  return {
    firstName,
    lastName,
    fullName: composeFullName(firstName, lastName) ?? normalizeNamePart(input.name),
  };
}

export function resolveFirstName(input: PersonNameInput) {
  return derivePersonNameFields(input).firstName;
}
