#!/bin/bash

# Generate index.ts exports for all .tsx files in the current directory

# Create or clear the index.ts file
echo "// Auto-generated exports" > index.ts
echo "// Generated on $(date)" >> index.ts
echo "" >> index.ts

# Process each .tsx file
ls *.tsx | sed 's/.tsx$//' | while read -r filename; do
  # Check if the file exists (just in case)
  if [ -f "${filename}.tsx" ]; then
    echo "export { } from \"./${filename}\";" >> index.ts
  fi
done

echo "" >> index.ts
echo "// End of auto-generated exports" >> index.ts

echo "index.ts generated successfully!"