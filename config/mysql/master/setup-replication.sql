CREATE USER IF NOT EXISTS 'replicator' @'%' IDENTIFIED
WITH
    mysql_native_password BY 'rep123456';

GRANT REPLICATION SLAVE ON *.* TO 'replicator' @'%';

FLUSH PRIVILEGES;