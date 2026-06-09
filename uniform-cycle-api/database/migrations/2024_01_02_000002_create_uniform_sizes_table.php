<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('uniform_sizes', function (Blueprint $table) {
            $table->id();
            $table->string('size_label', 20);
            $table->string('size_group', 20)->default('child');
            $table->integer('sort_order')->default(0);
            $table->text('description')->nullable();
            $table->integer('height_min')->nullable();
            $table->integer('height_max')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('uniform_sizes');
    }
};
