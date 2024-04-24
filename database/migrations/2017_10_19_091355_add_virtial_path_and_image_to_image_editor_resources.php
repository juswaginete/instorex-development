<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddVirtialPathAndImageToImageEditorResources extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('image_editor_resources', function (Blueprint $table) {
            $table->longText('image');
            $table->string('virtualPath');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('image_editor_resources', function (Blueprint $table) {
            $table->dropColumn('image');
            $table->dropColumn('virtualPath');
        });
    }
}
