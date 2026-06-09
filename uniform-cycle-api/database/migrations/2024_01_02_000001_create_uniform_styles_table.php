<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('uniform_styles', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('code', 50)->unique();
            $table->text('description')->nullable();
            $table->enum('gender', ['male', 'female', 'unisex'])->default('unisex');
            $table->enum('category', ['summer', 'winter', 'sports', 'ceremony'])->default('summer');
            $table->decimal('original_price', 8, 2)->nullable();
            $table->decimal('cycle_price', 8, 2)->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('uniform_styles');
    }
};
