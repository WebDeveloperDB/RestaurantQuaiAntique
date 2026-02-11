<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260129133815 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE food ADD picture_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE food ADD CONSTRAINT FK_D43829F7EE45BDBF FOREIGN KEY (picture_id) REFERENCES picture (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX IDX_D43829F7EE45BDBF ON food (picture_id)');
        $this->addSql('ALTER TABLE menu ADD picture_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE menu ADD CONSTRAINT FK_7D053A93EE45BDBF FOREIGN KEY (picture_id) REFERENCES picture (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX IDX_7D053A93EE45BDBF ON menu (picture_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE menu DROP CONSTRAINT FK_7D053A93EE45BDBF');
        $this->addSql('DROP INDEX IDX_7D053A93EE45BDBF');
        $this->addSql('ALTER TABLE menu DROP picture_id');
        $this->addSql('ALTER TABLE food DROP CONSTRAINT FK_D43829F7EE45BDBF');
        $this->addSql('DROP INDEX IDX_D43829F7EE45BDBF');
        $this->addSql('ALTER TABLE food DROP picture_id');
    }
}
