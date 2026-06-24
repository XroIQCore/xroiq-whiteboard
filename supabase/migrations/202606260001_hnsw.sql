DROP INDEX IF EXISTS file_vec_idx;
CREATE INDEX file_vec_idx
  ON file_vector USING hnsw (vec vector_l2_ops)
  WITH (m = 16, ef_construction = 128);
