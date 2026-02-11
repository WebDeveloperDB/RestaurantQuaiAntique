<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250731133224 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE "user" ALTER updated_at SET NOT NULL');
        $this->addSql('ALTER TABLE "user" ALTER api_token TYPE VARCHAR(64)');
        $this->addSql('ALTER TABLE "user" ALTER guest_number TYPE INT');
        $this->addSql('ALTER TABLE "user" ALTER last_name TYPE VARCHAR(100)');
        $this->addSql('ALTER TABLE "user" ALTER first_name TYPE VARCHAR(100)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_8D93D6497BA2F5EB ON "user" (api_token)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('DROP INDEX UNIQ_8D93D6497BA2F5EB');
        $this->addSql('ALTER TABLE "user" ALTER updated_at DROP NOT NULL');
        $this->addSql('ALTER TABLE "user" ALTER api_token TYPE VARCHAR(255)');
        $this->addSql('ALTER TABLE "user" ALTER guest_number TYPE SMALLINT');
        $this->addSql('ALTER TABLE "user" ALTER first_name TYPE VARCHAR(64)');
        $this->addSql('ALTER TABLE "user" ALTER last_name TYPE VARCHAR(64)');
    }
}
