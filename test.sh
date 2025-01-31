# For PostgreSQL
export DB_TYPE=postgres
export DB_HOST=report-poc.ctkye4e8aooi.us-east-1.rds.amazonaws.com
export DB_PORT=5432
export DB_NAME=report-poc
export DB_USER=postgres
export DB_PASSWORD=SuWY84R0imIBWZH5Bx5j

# Run migrations
# npm run db:migrate:pg

# For MSSQL
# export DB_TYPE=mssql
# export DB_HOST=localhost
# export DB_PORT=1433
# export DB_NAME=your_db
# export DB_USER=your_user
# export DB_PASSWORD=your_passwor

# sam deploy --profile futurify --region us-east-1 --stack-name report-poc-2 \
#   --parameter-overrides \
#   DataLakeType=mock \
#   DbType=postgres \
#   DbHost=report-poc.ctkye4e8aooi.us-east-1.rds.amazonaws.com \
#   DbPort=5432 \
#   DbName=report-poc \
#   DbUser=postgres \
#   DbPassword=SuWY84R0imIBWZH5Bx5j

 sam deploy --profile default --region ap-southeast-2 --stack-name poc-s3-structure \
   --parameter-overrides \
   DataLakeType=mock \
   DbType=postgres \
   DbHost=database-poc-1.cpqe2ukoeaji.ap-southeast-2.rds.amazonaws.com \
   DbPort=5432 \
   DbName=aws-poc-db \
   DbUser=root \
   DbPassword=root-123456789
