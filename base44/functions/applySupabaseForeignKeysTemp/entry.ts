import postgres from 'npm:postgres@3.4.5';

const candidates = [
  ['rooted21_families', 'owner_user_id', 'auth', 'users', 'id', 'Owner user account for each family'],
  ['rooted21_case_tasks', 'case_plan_id', 'public', 'rooted21_case_plans', 'id', 'Case task belongs to a case plan'],
  ['rooted21_case_tasks', 'evidence_document_id', 'public', 'rooted21_documents', 'id', 'Optional evidence document attached to a case task'],
  ['rooted21_reports', 'family_id', 'public', 'rooted21_families', 'id', 'Report belongs to a family'],
  ['rooted21_reports', 'created_by_user_id', 'auth', 'users', 'id', 'Report creator user account'],
  ['rooted21_behavior_logs', 'family_id', 'public', 'rooted21_families', 'id', 'Behavior log belongs to a family'],
  ['rooted21_behavior_logs', 'child_id', 'public', 'rooted21_children', 'id', 'Behavior log belongs to a child'],
  ['rooted21_daily_checkins', 'family_id', 'public', 'rooted21_families', 'id', 'Daily check-in belongs to a family'],
  ['rooted21_children', 'family_id', 'public', 'rooted21_families', 'id', 'Child belongs to a family'],
  ['rooted21_profiles', 'user_id', 'auth', 'users', 'id', 'Profile belongs to an app user account'],
  ['rooted21_documents', 'family_id', 'public', 'rooted21_families', 'id', 'Document belongs to a family'],
  ['rooted21_documents', 'uploaded_by_user_id', 'auth', 'users', 'id', 'Document uploader user account'],
  ['rooted21_family_professional_links', 'family_id', 'public', 'rooted21_families', 'id', 'Professional access link belongs to a family'],
  ['rooted21_family_professional_links', 'professional_user_id', 'auth', 'users', 'id', 'Professional link points to the professional user'],
  ['rooted21_family_professional_links', 'approved_by_user_id', 'auth', 'users', 'id', 'Professional link approval user'],
  ['rooted21_family_professional_links', 'access_code_id', 'public', 'rooted21_access_codes', 'id', 'Professional link created from an access code'],
  ['rooted21_class_progress', 'family_id', 'public', 'rooted21_families', 'id', 'Class progress belongs to a family'],
  ['rooted21_court_packets', 'family_id', 'public', 'rooted21_families', 'id', 'Court packet belongs to a family'],
  ['rooted21_access_codes', 'professional_user_id', 'auth', 'users', 'id', 'Redeemed access code points to a professional user'],
  ['rooted21_case_plans', 'family_id', 'public', 'rooted21_families', 'id', 'Case plan belongs to a family'],
  ['rooted21_audit_logs', 'family_id', 'public', 'rooted21_families', 'id', 'Audit log may belong to a family'],
  ['rooted21_audit_logs', 'actor_user_id', 'auth', 'users', 'id', 'Audit actor user account'],
];

const intentionallyUnlinked = [
  {
    table: 'rooted21_audit_logs',
    column: 'target_id',
    reason: 'Polymorphic audit target. It can refer to multiple record types, so a single foreign key would be inaccurate.',
  },
];

function q(value) {
  return '"' + String(value).replace(/"/g, '""') + '"';
}

function constraintName(table, column) {
  return `fk_${table}_${column}`.slice(0, 60);
}

Deno.serve(async () => {
  const databaseUrl = Deno.env.get('SUPABASE_DATABASE_URL');
  if (!databaseUrl) return Response.json({ error: 'SUPABASE_DATABASE_URL is not set' }, { status: 500 });

  const sql = postgres(databaseUrl, { ssl: 'require', max: 1, connect_timeout: 10, idle_timeout: 5, prepare: false });
  const created = [];
  const alreadyPresent = [];
  const skipped = [];
  const validated = [];

  try {
    await sql`set lock_timeout = '5s'`;
    await sql`set statement_timeout = '30s'`;

    for (const [fromTable, fromColumn, toSchema, toTable, toColumn, rationale] of candidates) {
      const name = constraintName(fromTable, fromColumn);

      const columnInfo = await sql`
        select c.data_type as from_type, c.udt_name as from_udt, c.is_nullable as nullable,
               r.data_type as to_type, r.udt_name as to_udt
        from information_schema.columns c
        join information_schema.columns r
          on r.table_schema = ${toSchema}
         and r.table_name = ${toTable}
         and r.column_name = ${toColumn}
        where c.table_schema = 'public'
          and c.table_name = ${fromTable}
          and c.column_name = ${fromColumn}
      `;

      if (columnInfo.length === 0) {
        skipped.push({ table: fromTable, column: fromColumn, target: `${toSchema}.${toTable}.${toColumn}`, reason: 'Column or target table was not found' });
        continue;
      }

      const fromType = columnInfo[0].from_udt;
      const toType = columnInfo[0].to_udt;
      if (fromType !== toType) {
        skipped.push({ table: fromTable, column: fromColumn, target: `${toSchema}.${toTable}.${toColumn}`, reason: `Type mismatch (${fromType} vs ${toType}); data type migration needed before a foreign key can be added` });
        continue;
      }

      const orphanRows = await sql.unsafe(`
        select count(*)::int as count
        from public.${q(fromTable)} source
        left join ${q(toSchema)}.${q(toTable)} target
          on source.${q(fromColumn)} = target.${q(toColumn)}
        where source.${q(fromColumn)} is not null
          and target.${q(toColumn)} is null
      `);
      const orphanCount = orphanRows[0]?.count || 0;
      if (orphanCount > 0) {
        skipped.push({ table: fromTable, column: fromColumn, target: `${toSchema}.${toTable}.${toColumn}`, reason: `${orphanCount} existing orphan value(s) found; left data unchanged` });
        continue;
      }

      const existing = await sql`
        select conname
        from pg_constraint
        where conrelid = ${`public.${fromTable}`}::regclass
          and contype = 'f'
          and conname = ${name}
      `;

      if (existing.length > 0) {
        alreadyPresent.push(`${fromTable}.${fromColumn} -> ${toSchema}.${toTable}.${toColumn}`);
      } else {
        await sql.unsafe(`
          alter table public.${q(fromTable)}
          add constraint ${q(name)}
          foreign key (${q(fromColumn)})
          references ${q(toSchema)}.${q(toTable)}(${q(toColumn)})
        `);
        created.push(`${fromTable}.${fromColumn} -> ${toSchema}.${toTable}.${toColumn}`);
      }

      const validatedFk = await sql`
        select convalidated
        from pg_constraint
        where conrelid = ${`public.${fromTable}`}::regclass
          and contype = 'f'
          and conname = ${name}
      `;
      validated.push({ relationship: `${fromTable}.${fromColumn} -> ${toSchema}.${toTable}.${toColumn}`, enforced: validatedFk[0]?.convalidated === true, rationale });
    }

    return Response.json({
      createdCount: created.length,
      alreadyPresentCount: alreadyPresent.length,
      validatedCount: validated.filter((item) => item.enforced).length,
      created,
      alreadyPresent,
      skipped,
      intentionallyUnlinked,
      validated,
    });
  } catch (error) {
    return Response.json({ error: error.message, created, alreadyPresent, skipped, intentionallyUnlinked, validated }, { status: 500 });
  } finally {
    await sql.end({ timeout: 5 });
  }
});