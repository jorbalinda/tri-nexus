-- Fix uploaded_files file_type constraint to include tcx and gpx
ALTER TABLE uploaded_files DROP CONSTRAINT IF EXISTS uploaded_files_file_type_check;
ALTER TABLE uploaded_files ADD CONSTRAINT uploaded_files_file_type_check
  CHECK (file_type IN ('fit', 'tcx', 'gpx', 'csv', 'pdf'));
