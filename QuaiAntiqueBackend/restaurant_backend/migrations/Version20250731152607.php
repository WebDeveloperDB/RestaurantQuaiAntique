<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250731152607 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP INDEX uniq_8d93d6497ba2f5eb');
        $this->addSql('ALTER TABLE "user" ADD nom VARCHAR(64) DEFAULT NULL');
        $this->addSql('ALTER TABLE "user" ADD prenom VARCHAR(64) DEFAULT NULL');
        $this->addSql('ALTER TABLE "user" DROP updated_at');
        $this->addSql('ALTER TABLE "user" DROP last_name');
        $this->addSql('ALTER TABLE "user" DROP first_name');
        $this->addSql('ALTER TABLE "user" ALTER created_at DROP NOT NULL');
        $this->addSql('ALTER TABLE "user" ALTER api_token TYPE VARCHAR(255)');
        $this->addSql('ALTER TABLE "user" ALTER guest_number TYPE SMALLINT');
        $this->addSql('ALTER INDEX uniq_8d93d649e7927c74 RENAME TO UNIQ_IDENTIFIER_EMAIL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE "user" ADD updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL');
        $this->addSql('ALTER TABLE "user" ADD last_name VARCHAR(100) DEFAULT NULL');
        $this->addSql('ALTER TABLE "user" ADD first_name VARCHAR(100) DEFAULT NULL');
        $this->addSql('ALTER TABLE "user" DROP nom');
        $this->addSql('ALTER TABLE "user" DROP prenom');
        $this->addSql('ALTER TABLE "user" ALTER api_token TYPE VARCHAR(64)');
        $this->addSql('ALTER TABLE "user" ALTER guest_number TYPE INT');
        $this->addSql('ALTER TABLE "user" ALTER created_at SET NOT NULL');
        $this->addSql('COMMENT ON COLUMN "user".updated_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('CREATE UNIQUE INDEX uniq_8d93d6497ba2f5eb ON "user" (api_token)');
        $this->addSql('ALTER INDEX uniq_identifier_email RENAME TO uniq_8d93d649e7927c74');
    }
}
