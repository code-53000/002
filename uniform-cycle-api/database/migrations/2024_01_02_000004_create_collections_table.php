<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('collections', function (Blueprint $table) {
            $table->id();
            $table->string('collection_no', 50)->unique();
            $table->unsignedBigInteger('style_id');
            $table->unsignedBigInteger('size_id');
            $table->enum('gender', ['male', 'female', 'unisex'])->default('unisex');
            $table->enum('condition', ['new', 'good', 'fair', 'poor'])->default('good');
            $table->text('defects')->nullable();
            $table->string('source_grade', 20)->nullable();
            $table->string('source_class', 20)->nullable();
            $table->string('donor_name', 50)->nullable();
            $table->string('donor_contact', 20)->nullable();
            $table->unsignedBigInteger('collected_by');
            $table->timestamp('collected_at');
            $table->enum('status', ['pending_cleaning', 'in_cleaning', 'cleaned', 'in_stock', 'distributed', 'scrapped'])->default('pending_cleaning');
            $table->text('inspection_notes')->nullable();
            $table->unsignedBigInteger('inspected_by')->nullable();
            $table->timestamp('inspected_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('style_id')->references('id')->on('uniform_styles');
            $table->foreign('size_id')->references('id')->on('uniform_sizes');
            $table->foreign('collected_by')->references('id')->on('users');
            $table->foreign('inspected_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('collections');
    }
};
