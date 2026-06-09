<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('inventory_id')->nullable();
            $table->unsignedBigInteger('collection_id')->nullable();
            $table->string('action', 50);
            $table->string('old_status', 50)->nullable();
            $table->string('new_status', 50)->nullable();
            $table->text('reason')->nullable();
            $table->unsignedBigInteger('performed_by');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('inventory_id')->references('id')->on('inventory')->onDelete('set null');
            $table->foreign('collection_id')->references('id')->on('collections')->onDelete('set null');
            $table->foreign('performed_by')->references('id')->on('users');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_logs');
    }
};
