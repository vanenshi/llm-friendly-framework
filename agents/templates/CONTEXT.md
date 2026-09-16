# <Project> — domain glossary

The closed vocabulary (`llm-09`). Code, i18n keys, table names and docs use only these terms.
Introducing, renaming or retiring a term updates this file in the **same change**. Alphabetical.

| Term       | Meaning (one sentence)                                                | Code identifier         | _Avoid_                       |
| ---------- | --------------------------------------------------------------------- | ----------------------- | ----------------------------- |
| Company    | A legal entity that buys or sells; the tenant boundary for every row. | `Company`, `company_id` | Organization, Tenant, Account |
| Membership | A user's role inside one company.                                     | `Membership`            | UserCompany, Assignment       |
| <Term>     | <meaning>                                                             | `<Identifier>`          | <synonyms not to use>         |

## Naming conventions derived from the glossary

- Route segments, table names and i18n key roots use the glossary term in the stack's casing.
- A slice is named `<Verb><Term>` (`SwitchCompany`) — the verb from the product's language, the
  noun from this table.
