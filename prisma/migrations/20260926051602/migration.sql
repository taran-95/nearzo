CREATE OR REPLACE FUNCTION immutable_array_to_string(text[], text)
RETURNS text
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $$ SELECT array_to_string($1, $2) $$;

ALTER TABLE "Offer"
ADD COLUMN search_vector tsvector
GENERATED ALWAYS AS (
  to_tsvector(
    'english',
    immutable_array_to_string("searchKeywords", ' ')
  )
) STORED;

CREATE INDEX offer_search_vector_idx
ON "Offer"
USING GIN (search_vector);