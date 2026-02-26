from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('form_management', '0001_initial'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunSQL(
                    sql='ALTER TABLE "form_management_formquestion" ALTER COLUMN "question_id" TYPE integer USING ((\'x\' || substr(md5("question_id"::text), 1, 8))::bit(32)::int);',
                    reverse_sql='ALTER TABLE "form_management_formquestion" ALTER COLUMN "question_id" TYPE uuid USING md5("question_id"::text)::uuid;',
                ),
            ],
            state_operations=[
                migrations.AlterField(
                    model_name='formquestion',
                    name='question_id',
                    field=models.IntegerField(db_index=True),
                ),
            ],
        ),
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunSQL(
                    sql='ALTER TABLE "form_management_questionlogic" ALTER COLUMN "source_question_id" TYPE integer USING ((\'x\' || substr(md5("source_question_id"::text), 1, 8))::bit(32)::int);',
                    reverse_sql='ALTER TABLE "form_management_questionlogic" ALTER COLUMN "source_question_id" TYPE uuid USING md5("source_question_id"::text)::uuid;',
                ),
            ],
            state_operations=[
                migrations.AlterField(
                    model_name='questionlogic',
                    name='source_question_id',
                    field=models.IntegerField(),
                ),
            ],
        ),
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunSQL(
                    sql='ALTER TABLE "form_management_questionlogic" ALTER COLUMN "target_question_id" TYPE integer USING ((\'x\' || substr(md5("target_question_id"::text), 1, 8))::bit(32)::int);',
                    reverse_sql='ALTER TABLE "form_management_questionlogic" ALTER COLUMN "target_question_id" TYPE uuid USING md5("target_question_id"::text)::uuid;',
                ),
            ],
            state_operations=[
                migrations.AlterField(
                    model_name='questionlogic',
                    name='target_question_id',
                    field=models.IntegerField(),
                ),
            ],
        ),
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunSQL(
                    sql='ALTER TABLE "form_management_formanswer" ALTER COLUMN "question_id" TYPE integer USING ((\'x\' || substr(md5("question_id"::text), 1, 8))::bit(32)::int);',
                    reverse_sql='ALTER TABLE "form_management_formanswer" ALTER COLUMN "question_id" TYPE uuid USING md5("question_id"::text)::uuid;',
                ),
            ],
            state_operations=[
                migrations.AlterField(
                    model_name='formanswer',
                    name='question_id',
                    field=models.IntegerField(db_index=True),
                ),
            ],
        ),
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunSQL(
                    sql='ALTER TABLE "form_management_responsefileupload" ALTER COLUMN "question_id" TYPE integer USING ((\'x\' || substr(md5("question_id"::text), 1, 8))::bit(32)::int);',
                    reverse_sql='ALTER TABLE "form_management_responsefileupload" ALTER COLUMN "question_id" TYPE uuid USING md5("question_id"::text)::uuid;',
                ),
            ],
            state_operations=[
                migrations.AlterField(
                    model_name='responsefileupload',
                    name='question_id',
                    field=models.IntegerField(db_index=True),
                ),
            ],
        ),
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunSQL(
                    sql='ALTER TABLE "form_management_questionanalytics" ALTER COLUMN "question_id" TYPE integer USING ((\'x\' || substr(md5("question_id"::text), 1, 8))::bit(32)::int);',
                    reverse_sql='ALTER TABLE "form_management_questionanalytics" ALTER COLUMN "question_id" TYPE uuid USING md5("question_id"::text)::uuid;',
                ),
            ],
            state_operations=[
                migrations.AlterField(
                    model_name='questionanalytics',
                    name='question_id',
                    field=models.IntegerField(db_index=True),
                ),
            ],
        ),
    ]
